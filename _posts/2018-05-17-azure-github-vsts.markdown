---
layout: post
title:  "Deploying to azure using Github and Visual studio Team services"
date:   2018-05-17 14:12:00
tags: [development,vsts,github,azure]
---

Currently I have a decently small project that consists of a React SPA that's built using webpack, the SPA communicates with a api that's built on .NET Core (2). The code for these 2 units lives in the same repo on Github and they are built on, and deployed to two separate app services on Azure when code is pushed to specific branches. The SPA is built with kudu which runs NPM install and a build script.

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

In the current UI of VSTS all the work that we'll be doing is "inside" of the "Build and Release" menu to the left.

## Creating a build config

1. In the "Builds" submenu click the "New" button and select your source control option (in our case github). You will now add this a "Service connection".

2. You should now be ready to setup the tasks for your build process. In our case we start with 3 steps for building our .NET Core app, all of these are of the ".NET Core" task type that you find when you click the button for adding tasks.
    1. The first one uses the "restore" command type to restore our dependencies before our build, just as you would on your local machine. In the "Path to projects" we add `**/*.csproj` as our project is nested in the repo (our working directory is the root of the repo that you setup when connecting to your source control).

    2. One ".NET Core" task of type "build", same path to projects, this will build your project(s) as it would on your machine, it's also possible to add arguments to this task.

    3. The last ".NET Core" task is of type "publish", I set the argument as `--output $(build.artifactstagingdirectory)/api` as I'd like to create a artifact with 2 root folders, one for the api, and one for the spa.

    4. As of writing nodejs 10 have just been released and our dependencies hasn't been updated for it. So our 4th step is of task type "Node Tool Installer" where we specify that it should download and use node 8.x.

    5. It's time to build our spa and the first task will be of type "npm" with the command "install" to make sure that all our dependencies are fetched. You should also specify the path to the folder that contains your package.json.

    6. One more task of type "npm" with the command type "custom", this will allow us to run a script in our package.json by adding `run {scriptname}` to the "Command and arguments" field.

    7. Our .NET Core app is already in our artifact staging directory, and now it's time to add our spa building tasks as well. This is accomplished by adding a "Copy files" task, for the source folder, specify the "build output" folder from the previous task (the result of running your script) and specify a "Contents" filter `**` will include everything. Then as the target, specify `$(build.artifactstagingdirectory)/web` and your staging directory should be filled with all your built code.

    8. The last task is to actually create the artifact, add a task of type "Publish Build Artifacts" with `$(Build.ArtifactStagingDirectory)` as the "Path to publish" and set a "Artifact name" that you like, this name will show up when we create the release. 

3. Under the triggers tab you should see that it's setup to build continuously from the branch that you specified, this means that a new build will be triggered each time you add commits to that branch, which in turns create an artifact.

4. The thing that I had the hardest time wrapping my head around, and the thing that added the most steps to our process was variables. For .NET projects it's quite easy as environments are "applied" during startup which means that we could add them as Azure app service app configurations and everything's nice and dandy. But for the spa the problem is that environment variables that we use through `process.env.*` are inlined as strings, which would be quite hard to replace during the deployment step. My solution to this was to add the environment variables as tokens in the build step. You do this in the `Variables` tab, for instance, I have a variable called `API_URL` in the app. I add a new row in the `Variables` tab with name `API_URL` and the value `##{API_URL}""`. You could use anything as the variable value here (such as the actual api url), but the point for us is to use a common tokenization scheme (`##{variablename}` in my case) which will be replaced during the release step.

You now have a continuous build which will drop artifacts when you push to your branch.

## Creating releases

1. We now switch to the releases submenu and choose `Create a new release pipeline`

2. A release is meant to deploy an artifact which could come from several different places, but in our case we're using VSTS as the build agent as well. We click `Add new artifact` and select `Build`, pick our project and the source build pipeline. This tells VSTS to use the artifact from that pipeline.

3. We will now add stages to the release pipeline, this is where we will configure our environments that we should deploy to. In our case we will add a environment for continuous deployment (test) that can later be promoted to another environment (production). Select `Add new stage`, in my case I select to start from empty since we're going to make a few changes anyways.

4. Click the `1 job, 0 tasks` label to configure your tasks. The steps that we're interested in for this is:
    1. Replace the environment varaible tokens with actual values.
    2. Deploy the API.
    3. Deploy the SPA.

5. Click `Add new task` and find and install the `Replace Tokens` tasks from the marketplace.
    1. When configuring this we should point the `Root directory` to the folder (inside of the artifact) which contains our built SPA (.js file(s)). If your build configuration has already ran once then you should be able to use the file selector next to the `Root directory` input to inspect the artifact and select the folder, otherwise you could input it with the following format `$(System.DefaultWorkingDirectory)/nameofproject/pathtofolder`.
    2. In `Target files` I use `**/*.js` to replace inside of all js files in the artifact folder (below the selected `Root directory`).
    3. Expand the `Advanced` group and input `##{` as `Token prefix` and `}##` as token suffix, as this is what our variable names are wrapped in.

6. This is a good time to input our variables in the `Variables` tab (don't confuse this with the `Variables` tab in the build config, we're still in the release config). The variable name on each row should have the same name as in the build config variables (untokenized), meaning that since we have a `API_URL` environment variable in the SPA, then we should input that as the name on a variable row with the api url as the value field. This value will now be inlined in the deployed `.js` files.

7. We may now continue to add our two deployments (API and the SPA) as separate tasks of type `Azure App Service Deploy`.
    1. Pick you azure subscription which you should have connected to VSTS already (added a service principal in Azure).
    2. Slect `App type`, in our case that's `Web App`.
    3. Select the app service and configure wether you're deploying to a slot or not.
    4. Pick the correct path to what should get deployed from the artifact (as we're combining the API and SPA in the same artifact), with the following format: `$(System.DefaultWorkingDirectory)/project name/pathtofolder`.

8. We're now ready to setup our release triggers, you find the trigger configuration by clicking the "lightning bolt and user icon" on the left of the stage "box". For me this means that I've setup to identical `Stages` (except for the variables and app service configurations). Where one (test) is setup with the `After release` trigger. And the other (production) is manual only.

    This means that when a new build is available, a release with the test configuration will be created and immediately deployed to the test environment. Once this is verified I may manually deploy the "same" release to production.

