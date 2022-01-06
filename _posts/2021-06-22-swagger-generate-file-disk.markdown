---
layout: post
title:  "Generate Swagger file to disk with Swashbuckle in DevOps"
date:   2021-06-22 16:41:00
tags: [development,csharp,dotnet,swagger,devops]
---

## Actual real life problem
We've got a .NET core project with a [web API](https://docs.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-3.1&tabs=visual-studio), and we're using [Swashbuckle](https://docs.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-3.1&tabs=visual-studio) to generate [Swagger](https://swagger.io/) [Open API](https://www.openapis.org/) documentation for it.

Now we want to integrate this into our API Management instance, using a custom DevOps task (not important for this post) which requires us to have a Swagger/Open API file on disk.
<!--more-->

## Solution
First things first, how do we generate a swagger.json file (the one you configure using `SwaggerEndpoint("route", "description"` in your `Startup.Configure` is dynamically generated and not stored anywhere). It turns out that Swashbuckle has a [tool for precisely this](https://github.com/domaindrivendev/Swashbuckle.AspNetCore#using-the-tool-with-the-net-core-30-sdk-or-later) that we may use. More info about using `dotnet tool` may be found [here](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-tool-install).

### Devops
What would this look like when we want to integrate it into our DevOps build pipeline? Assuming that you've generated a tools manifest file by running `dotnet new tool-manifest` in your project folder, and added the Swagger tool to it by running `dotnet tool install --version 6.1.4 Swashbuckle.AspNetCore.Cli`.

If you aren't using any `dotnet tools` in your pipeline right now, then you would probably need add a task to restore the tools found in your manifest file. That would look something like this:
```
- task: DotNetCoreCLI@2
  displayName: 'Restore tools'
  inputs:
    command: custom
    custom: tool
    arguments: restore --tool-manifest My.Project/.config/dotnet-tools.json
```
In my example our project is found in a subfolder of the repository called `My.Project`, and our tools manifest files is called `dotnet-tools.json` which is inside the folder `.config` (default if you run `dotnet new tool-manifest`).


Now this installs the tool itself as a local (as opposed to global) tool, the next step would be to generate the file, which would look something like this:
```
- task: DotNetCoreCLI@2
  displayName: 'Build Swagger v1'
  inputs:
    command: custom
    custom: swagger
    arguments:  tofile --output $(Build.ArtifactStagingDirectory)/swagger.json $(System.DefaultWorkingDirectory)/My.Project/bin/Release/netcoreapp3.1/My.Project.dll v1
    workingDirectory: My.Project
```

Notice:
- We're outputting the build file as `swagger.json`, and we're dropping it straight into our `$(Build.ArtifactStagingDirectory)`, which means that we will need to have a publish artifact task after this in the pipeline.
- We're using the assembly `$(System.DefaultWorkingDirectory)/My.Project/bin/Release/netcoreapp3.1/My.Project.dll` which means that we need to have a build task before this (release configuration).
- The last part of the `arguments` is `v1`. This is because that's the name of my Swagger doc as configured in `Startup.ConfigureServices`, this is also the default document name when you call `services.AddSwaggerGen` without any arguments. This would be different if you've [set a custom document name](https://docs.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-5.0&tabs=visual-studio#api-info-and-description).
- We're setting the `workingDirectory` to `My.Project` as this is where the `Swagger` tool is installed.

## Result
This is what a complete DevOps pipeline file could look like for accomplishing this:
```
steps:

- task: UseDotNet@2
  displayName: 'Install .NET Core SDK'
  inputs:
    packageType: 'sdk'
    version: '3.1.x'

- task: DotNetCoreCLI@2
  displayName: 'Restore tools'
  inputs:
    command: custom
    custom: tool
    arguments: restore --tool-manifest My.Project/.config/dotnet-tools.json

- task: DotNetCoreCLI@2
  displayName: 'dotnet build'
  inputs:
    command: build
    projects: My.Project/*.csproj
    arguments: -c Release

- task: DotNetCoreCLI@2
  displayName: 'dotnet publish'
  inputs:
    command: publish
    projects: My.Project/*.csproj
    publishWebProjects: false
    arguments: -c Release -o $(Build.ArtifactStagingDirectory)/My.Project/
    zipAfterPublish: True

- task: DotNetCoreCLI@2
  displayName: 'Build Swagger v1'
  inputs:
    command: custom
    custom: swagger
    arguments:  tofile --output $(Build.ArtifactStagingDirectory)/swagger.json $(System.DefaultWorkingDirectory)/My.Project/bin/Release/netcoreapp3.1/My.Project.dll v1
    workingDirectory: My.Project

- task: PublishBuildArtifacts@1
  displayName: 'Publish Artifacts'
  inputs:
    pathToPublish: $(Build.ArtifactStagingDirectory)/
    artifactName: My.Artifact
```

What this does is:
1. Use .NET Core 3.1 (always good to be specific about which version you're using).
1. Restore our tool.
1. Build our project.
1. Publish our project using the release configuration to the artifact staging directory.
1. Builds our our Swagger file to the artifact staging directory.
1. Publish everything in the artifact staging directory as an artifact.

## Versions used
- .NET Core 3.1
- Swashbuckle.AspNetCore v6.1.4
- Swashbuckle.AspNetCore.Cli v6.1.4
