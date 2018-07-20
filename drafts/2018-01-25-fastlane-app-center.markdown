---
layout: post
title:  "Xamarin UserControl instantiation and binding context"
date:   2018-01-16 14:45:00
tags: [development,xamarin,forms, appcenter,ios]
---

run fastlane match {type} to get the ids of your signing profiles and certificates. This will also install the profiles and certs on your computer.

If you have access to developer.apple.com you could also download them directly. But part of using fastlane is that not all developers needs access to the developer portal.


+-------------------+--------------------------------------------------------------------+
|                                 Installed Certificate                                  |
+-------------------+--------------------------------------------------------------------+
| User ID           | xxxxxxxxxx                                                         |
| Common Name       | iPhone Distribution: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |
| Organisation Unit | xxxxxxxxxx                                                         |
| Organisation      | xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                                   |
| Country           | US                                                                 |
| Start Datetime    | xxxxxxxxxxxxxxxxxxxxxxxx                                           |
| End Datetime      | xxxxxxxxxxxxxxxxxxxxxxxx                                           |
+-------------------+--------------------------------------------------------------------+

+---------------------+------------------------+------------------------+
|                    Installed Provisioning Profile                     |
+---------------------+------------------------+------------------------+
| Parameter           | Environment Variable   | Value                  |
+---------------------+------------------------+------------------------+
| App Identifier      |                        | se.xxxx.xxxxxxxxxxx    |
| Type                |                        | appstore               |
| Platform            |                        | ios                    |
| Profile UUID        | sigh_se.xxxx.xxxxxxxx  | xxxxxxxx-xxxx-xxxx-xx  |
|                     | xxx_appstore           | xx-xxxxxxxxxxxx        |
| Profile Name        | sigh_se.xxxx.xxxxxxxx  | match AppStore         |
|                     | xxx_appstore_profile-  | se.coor.myworkplace    |
|                     | name                   |                        |
| Profile Path        | sigh_se.xxxx.xxxxxxxx  | /Users/xxxxxxxxxxxxxx  |
|                     | xxx_appstore_profile-  | xxxx/Library/MobileDe  |
|                     | path                   | vice/Provisioning      |
|                     |                        | Profiles/xxxxxxxx-xxx  |
|                     |                        | x-xxxx-xxxx-xxxxxxxxx  |
|                     |                        | db5.mobileprovision    |
| Development Team ID | sigh_se.xxxx.xxxxxxxx  | 73QMR3M83N             |
|                     | xxx_appstore_team-id   |                        |
+---------------------+------------------------+------------------------+

Find the signing profile with the id in /Users/{user}/Library/MobileDevice

export the certificate from your keychain. upload these into app center with the password that you used to export the certificate (.p12)