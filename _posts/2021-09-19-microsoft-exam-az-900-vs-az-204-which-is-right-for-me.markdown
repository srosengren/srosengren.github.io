---
layout: post
title:  "Microsoft exam AZ-900 vs AZ-204, which one is right for me?"
date:   2021-09-19 16:41:00
tags: [development,azure,certifications]
---

So you're interested in taking either/or both the [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) and the [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204) exams in order to become Microsoft certified as a Azure Fundamentals or Azure Developer Associate. That's great! Perhaps you're starting your journey towards a cloud oriented role, want to make sure that you don't have gaps in your knowledge, or want to demonstrate your level of knowledge.

I recently did them back to back and are hoping that I can bring some insights that will help you decide your own path.
<!--more-->
## Quick intro to Microsoft exams and certifications
You might be confused as to why there's both a concept of exams and certifications. Well, in the case of [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) and [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204) there's a 1 to 1 relationship between them, pass the exam [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) and become "Microsoft Certified: Azure Fundamentals", or pass the exam [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204) and become "Microsoft Certified: Azure Developer Associate". But in some cases, as for becoming "Microsoft Certified: Azure Solutions Architect Expert" you need to pass the 2 exams [AZ-303](https://docs.microsoft.com/en-us/learn/certifications/exams/az-303) and [AZ-304](https://docs.microsoft.com/en-us/learn/certifications/exams/az-304).

There also used to be a program called "Microsoft Certified Professional" which contained the Microsoft Certified Solutions Developer (MCSD), Microsoft Certified Solutions Expert (MCSE) and Microsoft Certified Solutions Associate (MCSA) certifications which you got for passing multiple exams (where each one might give you a separate certification). This has since been retired but you might find references to it in study material or when contacting training/exam providers.

## Who are [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) and [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204) for
Let's have a look at the 2 certifications and who they're geared towards.

### In Microsofts own words

Microsoft has this to say for why and who [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) is for:
> Candidates for the Azure Fundamentals certification should have foundational knowledge of cloud services and how those services are provided with Microsoft Azure. This certification is intended for candidates who are just beginning to work with cloud-based solutions and services or are new to Azure.

And that it's suited for the following roles: `Administrator, Business User, Developer, Student, Technology Manager`.

And the following for [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204):
> Candidates for the Azure Developer Associate certification should have subject matter expertise in designing, building, testing, and maintaining cloud applications and services on Microsoft Azure.

And that it's suited for the following roles: `Developer`.

### My view on this
Microsoft's page for [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) mentions that `This certification is intended for candidates who are just beginning to work with cloud-based solutions`, but I have worked with Azure for about 8 years and I'd say that I found value in preparing for this exam. There's always the possibility that you have gaps in your knowledge depending on what you do. For instance, 95% of my projects contains an App Service (either web or Function) and a storage solution of some sort, but I've never worked with Virtual Machines or the IoT offerings. Taking this exam has given me a deeper understanding of what some services might be used for, increasing my ability to pick the right service for a project.

The roles that Microsoft deems [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) suited for are `Administrator, Business User, Developer, Student, Technology Manager`, and it might be covered under `Business User`, but as a consultant I'd definitely add `Sales` to this list.

## What's the actual difference?
In short: [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) is about *when* you would use a specific service, whereas [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204) is about *how* you would use it. For passing [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) you would be expected to know how to choose between using a Service Bus, or a Event Hub for a specific scenario. But for [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204) you would be expected to know which consistency level to choose for Cosmos DB for a scenario.

## Which one is right for me and my role?

### Should I as an experienced developer do [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900)?
I'd argue yes, for the following reasons:
- I've mentioned above that even if you're used to Azure, you're probably not used to all the services. This exam will expose you to most of the core services, giving you a better ability to make decisions.
- A lot of the services *could* technically be used to accomplish the same goal, on the surface most of the Event, Messaging, and even IoT services could be used to build an event based system, and if you've used Service Bus (Messaging), then you might simply grab this from your toolbox even when Event Hub is the appropriate choice.
- [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) covers quite a bit of Azure identity services and governance which is something that you might need a crash course in if you purely do apps development. Not nothing this could come back to bite you quite hard in the future (unsecure apps or infrastructure etc). Studying for [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) might give you the insight that you don't know as much as you thought about these topics.

### Should I as an beginner/junior/student do [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900)?
Most definitely! I'd say that studying for [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) is a really good crash course that will prepare you for working as a developer, or any other role that's mentioned above.

### Should I who work in a infra focused role do [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204)?
I'd say that [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204) is even more focused on the infrastructure parts than what I would call "pure" dev. There's quite a lot more focus on SKUs and configuring services then there's code examples and SDK usage.

### Should I as an experienced developer do [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204)?
I'd say that for me personally, [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) was more rewarding than [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204). The reason for this is that [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) "opened my eyes" to some of the services that I've never used, whereas [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204) told me more in depth how to configure them. But to me the most important part was knowing *when* to use them, not *how* to configure them, as that's something that I could do once I've decided to use a specific service.

This is not to say that [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204) isn't valuable, for me this forced me to sit down and actually study minutia of the services, which in some cases surfaced things I didn't know. But I don't think it provided the same value for my day to day job as [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) did.

## Will passing these help me get a job?
Perhaps.
- If you're applying for a position with a Microsoft partner, then having one or both of these certifications could be the edge that pushes you ahead if all else is equal to the other candidates, as having employees with certifications is an important part of maintaining your Microsoft partner level.
- Having one or both of these on your CV might steer your interview(s), telling the interviewer something about your level of expertise which could help them better utilize your, perhaps, limited time for the interview.

## How hard are they to pass?
I'm preparing separate blog posts for how to study for each of the exams. But I'd say that [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) is something that you might be able to pass after studying each night for a week even if you started from almost zero. [The pluralsight course for AZ-900](https://app.pluralsight.com/paths/certificate/microsoft-azure-fundamentals-az-900) is 9 hours 33 minutes at 1x speed and I'd say that it covers most that you need to know (at least from the parts that I viewed).

[AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204) was a bit different for me as a lot of the exam actually revolves around using `AZ PowerShell` and `az cli` which I mostly only use for things that aren't possible to do through ARM templates, or something that I do often enough that it's a hassle to use the portal. I'd say that I spent about 15-20 hours preparing for this.

## Could I as an experienced developer book a session for the [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) exam and pass it without studying.
Perhaps, but I'm fairly certain that I wouldn't have. And also, for me, the [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900) was about filling the gaps, not getting a badge (as a fundamentals badge isn't that cool after years of experience).

## References
- [Microsoft Certified: Azure Fundamentals](https://docs.microsoft.com/en-us/learn/certifications/azure-fundamentals/)
- [Microsoft Certified: Azure Developer Associate](https://docs.microsoft.com/en-us/learn/certifications/azure-developer/)
- [Microsoft Certified: Azure Solutions Architect Expert](https://docs.microsoft.com/en-us/learn/certifications/azure-solutions-architect/)
- [AZ-900](https://docs.microsoft.com/en-us/learn/certifications/exams/az-900)
- [AZ-204](https://docs.microsoft.com/en-us/learn/certifications/exams/az-204)
- [AZ-303](https://docs.microsoft.com/en-us/learn/certifications/exams/az-303)
- [AZ-304](https://docs.microsoft.com/en-us/learn/certifications/exams/az-304)
