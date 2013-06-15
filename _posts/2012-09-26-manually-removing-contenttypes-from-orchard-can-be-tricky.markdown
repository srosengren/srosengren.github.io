---
layout: post
title:  "Manually removing ContentTypes from Orchard can be tricky."
date:   2012-09-26 20:52:00
tags: [orchard,contenttype,datamigration,development,web]
---

I was experimenting with a new contentpart widget tonight, and when I was done I had a couple of UpdateFromX methods in my migrations.cs file. So I thought to myself, this doesn't look very good, lets delete everything from the DB and then combine this to a pretty Create method instead. At first I thought, hey maybe I'll only have to remove the table that stores the records themselved. This was of course not enought. I realized that I also had to remove it from the Orchard_Framework_DataMigrationRecord and Orchard_Framework_ContentTypeRecord tables. I think this would be it if I hadn't been clever enough to actually create a couple of widgets and place them on the layer that displays on my homepage.

This was of course happening while I was struggling with som multi-tenancy issues so I left this here thinking I was done and started to tackle one of my subsites. Well that site would of course not start and instead gave me this error: **no row with the given identifier exists[orchard.contentmanagement.records.contentitemrecord#15]** 

Now that I think back I realize that this error message actually makes a lot of sense. I had a contentrecord with the ContentType_id set to the removed contentype's id (**15**) in my&amp Orchard_Framework_ContentItemRecord table. I thought that this would be it and removed it. But there was still a final puzzlepiece missing, the Orchard_Framework_ContentItemVersionRecord that contained a row with the id of the removed record.

There are also a couple of tables that might have to be considered if you plan on making major changes while cleaning up your migration file and these are the Settings_* tables. They contain the settings for your record/part and are worth looking into if you are changing the settings during cleanup.