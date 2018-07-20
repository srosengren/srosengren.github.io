---
layout: post
title:  "Deploying to azure using Github and Visual studio Team services"
date:   2018-05-17 14:12:00
tags: [development,vsts,github,azure]
---

Currently I have a decently small project that consists of a React SPA that's build using webpack, the SPA communicates with a api that's build on .NET Core (2). The code for these 2 units lives in the same repo on Github and they are built on, and deployed to two separate app services on Azure when code is pushed to specific branches. The SPA is built with kudu which runs NPM install and a build script.

This definitely works for simple uses cases, but it caues some issues for us as one of the app/apis might fail to build/deploy while the other succeeded. Building a SPA app also takes quite a while on Azure, this especially creates a problem as we use branches for stage/production and having both of them build in serial. And while it creates an artifact that you may revoke/redploy, it's not something that's a unit that you could use for other purposes.

The requirements that we came up with were:
- Building the app should create a standalone artifact that may be deployed at will.
- A build artifact should deploy to a stage environment by default, and to production from the same artifact at will.
- It should be possible to have different environment variables for stage/production environments, while still deploying the same build artifact to both environments, this should apply to both the api and the SPA.
- If the one of the builds should fail, then none of them should deploy.

We picked Visual studio Team services for no other reason except that it supports our requirements (and a 1000 other things we don't need right now).

I'd say that for our use case the 3 main things to know about in VSTS are Builds (and build artifacts), releases, and environments (which are parts of releases). A build could deploy directly to Azure without creating an artifact, but that would fail the requirement of being able to deploy the same build to a different environment. A release can be setup to consume several artifacts and deploy them, but in our case I opted to build a single artifact for our api and spa as they're never deployed separately.

Important things:
- Releases are sort of immutable, modifications to an environment configuration will not be applied if you redeploy a existing release to that environment.
- You will need to add a service principal in Azure that connects it to you VSTS account, I have no idea how to do that as I was not the admin for the Azure subscription in this case.

In the current UI of VSTS all the work that we'll be doing is "inside" of the "Build and Release" tab at the top.

## Creating a build config

1. In the "Builds" submenu click the "New" button and select your source control option (in our case github). You will now add this a "Service connection".

2. You should now be ready to setup the tasks for your build process. In our case we start with 3 steps for build our .NET Core app, all of these are of the ".NET Core" task type that you find when you click the button for adding tasks.
    1. The first one uses the "restore" command type to restore our dependencies before our build, just as you would on your local machine. In the "Path to projects" we add `**/*.csproj` as our project is nested in the repo (our working directory is the root of the repo that you setup when connecting to your source control).

    2. One ".NET Core" task of type "build", same path to projects, this will build your project(s) as it would on your machine, it's also possible to add arguments to this task.

    3. The last ".NET Core" task is of type "publish", I set the argument as `--output $(build.artifactstagingdirectory)/api` as I'd like to create a artifact with 2 root folders, one for the api, and one for the spa.

    4. As of writing nodejs 10 have just been released and our dependencies hasn't been updated for it. So our 4th step is of task type "Node Tool Installer" where we specify that it should download and use node 8.x.

    5. It's time to build our spa and the first task will be of type "npm" with the command "install" to make sure that all our dependencies are fetched. You should also specify the path to the folder that contains your package.json.

    6. One more task of type "npm" with the command type "custom", this will allow us to run a script in our package.json by adding `run {scriptname}` to the "Command and arguments" field.

    7. Our .NET Core app is already in our artifact staging directory, and now it's time to add our build spa as well. This is accomplished by adding a "Copy files" task, for the source folder, specify the "build output" folder from the previous task (the result of running your script) and specify a "Contents" filter `**` will include everything. Then as the target, specify `$(build.artifactstagingdirectory)/web` and your staging directory should be filled with all your built code.

    8. The last task is to actually create the artifact, add a task of type "Publish Build Artifacts" with `$(Build.ArtifactStagingDirectory)` as the "Path to publish" and set a "Artifact name" that you like, this name will show up when we create the release. 

3. Under the triggers tab you should see that it's setup to build continuously from the branch that you specified, this means that a new build will be triggered each time you add commits to that branch, which in turns create an artifact.

4. The thing that I had the hardest time wrapping my head around, and the thing that added the most steps to our process was variables. For .NET projects it's quite easy as environments are "applied" during startup which means that we could add them as Azure app service app configurations and everything's nice and dandy. But for the spa the problem is that environment variables that we use through `process.env.*` are inlined as strings, which would be quite hard to replace during the deployment step. My solution to this was to add the environment variables as tokens in the build step. Our app is scaffolded using `create-react-app` meaning that we by default may use environment variables with the `REACT_APP_*` format. 