---
layout: post
title:  "How to run NPM scripts (or do other stuff) when deploying to azure from github"
date:   2016-01-27 15:30:00
tags: [development,web,configuration,azure,node,github]
---

How to modify the deployment process of microsoft azure is one of those things that I keep forgetting how to do, or find myself making more complicated than it has to be.

This post assumes that you're deploying with continuous deployment from github, but it should be the same for most of the deployment processes that you can use with azure, except for maybe ftp deployment.

The short answer on how to do this is: add a deploy.cmd, or .sh depending on what you're comfortable with, to your repository. This should contain the code that you want to run during deployment. Then add a .deployment file pointing to your deploy.[cmd,sh] file and presto.

Seems easy enough right? Well the problem here is that azure won't do anything other than what you tell it to in the deploy file, since adding this is basically you telling azure that you're taking over the deployment. The easiest way to get around this is to get a hold of the default azure deploy.cmd file.

One way to get that is to retrieve it from an existing node app running in azure via ftp. Another way is to get it using the azure cli.

    npm install azure-cli -g
    azure site deploymentscript --node

This will generate a .deployment and deploy.cmd file in your current directory. Put these in your repositorys root directory and modify the deploy.cmd file to do what you want.

##Example: run NPM script after deployment and npm dependencies install.

Let's first take a look at the code that we're going to add to our deploy.cmd file.

{% highlight bat %}
:: 4. Run NPM script
echo Run NPM script

pushd "%DEPLOYMENT_TARGET%"
call :ExecuteCmd !NPM_CMD! run myscipt
popd

{% endhighlight %}

1. The first two lines are just for our sake, the first line is just a comment in the file, and the echo line will show up in azure logs. 
2. `The pushd "%DEPLOYMENT_TARGET%"` line is for moving into the deployment directory (wwwroot) since we're currently in the repository directory. 
3. We then run `call :ExecuteCmd !NPM_CMD! run myscipt` to execute our script (change myscript to the name you've given your script in package.json). 
4. We then run `popd` to reset which directory we're in, as to not interfere with the rest of the deployment process.

Well, were do with put this code snippet then?

##deploy.cmd

Here's a pristine azure node deploy file. We would insert our code snippet as the 4th step under the deployment step (line #107)

{% highlight bat %}
@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: ----------------------
:: KUDU Deployment Script
:: Version: 1.0.6
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Setup
:: -----

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%.
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=%appdata%\npm\kuduSync.cmd
)
goto Deployment

:: Utility Functions
:: -----------------

:SelectNodeVersion

IF DEFINED KUDU_SELECT_NODE_VERSION_CMD (
  :: The following are done only on Windows Azure Websites environment
  call %KUDU_SELECT_NODE_VERSION_CMD% "%DEPLOYMENT_SOURCE%" "%DEPLOYMENT_TARGET%" "%DEPLOYMENT_TEMP%"
  IF !ERRORLEVEL! NEQ 0 goto error

  IF EXIST "%DEPLOYMENT_TEMP%\__nodeVersion.tmp" (
    SET /p NODE_EXE=<"%DEPLOYMENT_TEMP%\__nodeVersion.tmp"
    IF !ERRORLEVEL! NEQ 0 goto error
  )
  
  IF EXIST "%DEPLOYMENT_TEMP%\__npmVersion.tmp" (
    SET /p NPM_JS_PATH=<"%DEPLOYMENT_TEMP%\__npmVersion.tmp"
    IF !ERRORLEVEL! NEQ 0 goto error
  )

  IF NOT DEFINED NODE_EXE (
    SET NODE_EXE=node
  )

  SET NPM_CMD="!NODE_EXE!" "!NPM_JS_PATH!"
) ELSE (
  SET NPM_CMD=npm
  SET NODE_EXE=node
)

goto :EOF

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------

:Deployment
echo Handling node.js deployment.

:: 1. KuduSync
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_SOURCE%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
  IF !ERRORLEVEL! NEQ 0 goto error
)

:: 2. Select node version
call :SelectNodeVersion

:: 3. Install npm packages
IF EXIST "%DEPLOYMENT_TARGET%\package.json" (
  pushd "%DEPLOYMENT_TARGET%"
  call :ExecuteCmd !NPM_CMD! install --production
  IF !ERRORLEVEL! NEQ 0 goto error
  popd
)


::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.
{% endhighlight %}