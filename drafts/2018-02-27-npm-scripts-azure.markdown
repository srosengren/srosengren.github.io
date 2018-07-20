---
layout: post
title:  "Using NPM scripts when deploying to azure"
date:   2018-02-27 23:45:00
tags: [development,node,npm,azure]
---

Azure doesn't like `&&` in commands, in one instance I was setting a environment variable using `cross-env` and running another command using `&&`, the setting of the variable was silently ignored while the other command ran.

Remember that you can sign in to kudo and run your npm scripts in the console instead of continuing to deploy using CI which takes quite a bit longer.

Remember to not have a folder that your build script (or other) needs, open in kudo as a CI build will fail if it's locked. (This might have been caused by running the build script both through CI and in kudo)

If you're using a npm variable such as `$npm_package_version`, then it should instead be wrapped in `%` as such `%npm_package_version%`, to work in powershell/cmd.