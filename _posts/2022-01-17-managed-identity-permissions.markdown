---
layout: post
title:  "Handling permissions for Azure resource's Managed Identity"
date:   2022-01-17 18:13:00
tags: [development,azure]
---
## Actual real life problem

I'm using [System Assigned Managed Identities](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview) for some of my App Services in order to not handle credentials manually in code, and also to make sure that the life cycle of the Service Principal (a managed identity is a Service Principal) matches that of the App Service, making sure that there's no lingering resources or granted permissions after the deletion of an App Service.

Now I want to grant these identities permissions to both [Graph API](https://docs.microsoft.com/en-us/graph/use-the-api) and some of my own APIs (which are App registrations with backing Service Principals, but that's for another post). Currently there's no way of doing this through the Azure portal, meaning that it's not possible to go to the Service Principal for your API, clicking "Users and groups" and assigning your Managed Identity a role for your API, the Managed Identity will not show up like a regular user (which is also a Service Principal) would.

## Solution

I've used the PowerShell scripts found in [this blog post](https://aztoso.com/security/microsoft-graph-permissions-managed-identity/) in order to assign the permissions to the Managed Identity, the script only needs the name of the Managed Identity, which happens to be the same as my App Service (It's also possible to find the Managed Identity ID directly on the `Identity` tab of the App Service in the portal). The example is for assigning permissions to Graph API, but it's easy enough to change in order to assign permissions for your own API. Replace the assignment of `$GraphAppId` to be the Service Principals `Object ID` (as opposed to `Application ID`).

## How do we verify that it worked?

The PowerShell succeeding is a good indicator, but I want to see the assigned permissions for the Managed Identity. In the PowerShell we used to assign permissions we se the command `New-AzureAdServiceAppRoleAssignment` being used, so running `Get-AzureAdServiceAppRoleAssignment` should return the permissions right? Well apparently not, I assume that this command "only" works for regular non-Managed Identity Service Principals (such as users and manually created Service Principals). There is however another command called [Get-AzureADServiceAppRoleAssignedTo](https://docs.microsoft.com/en-us/powershell/module/azuread/get-azureadserviceapproleassignedto?view=azureadps-2.0), the documentation for this hasn't been filled out at the time of writing, but this is the command that we want. Using the ID of your Managed Identity as the Object ID parameter for the command will produce output that looks like this:

![Screenshot of PowerShell output from running get-azureadserviceapproleassignedto](/media/Get-AzureADServiceAppRoleAssignedTo.png)

Here we can see that we've assigned 3 permissions for Graph API and one permission for our own API to our Managed Identity.

While doing this I also realized that it's possible to verify this through the portal. [This blog post](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/how-to-view-managed-identity-service-principal-portal) shows you how to find it among your other Service Principals in Azure Active Directory. You may think that you're able to reach it by going to the Identity tab of the App Service and clicking "Azure role assignments", but that doesn't work unfortunately. Once you've found the Managed Identity Service Principal in the portal, you're able to view the permissions just as you would on any other Service Principal. Here's what that looks like in our example:

![Screenshot of viewing permissions for a Managed Identity in the portal](/media/ManagedIdentity-Permissions-Portal.png)
