---
layout: post
title:  "IdentityServer4 with Azure KeyVault"
date:   2018-01-05 15:30:00
tags: [development,azure,identityserver,oauth,keyvault]
---

So you're using IdentityServer4 in your .NET Core application that you'd also like to deploy to Azure. You've been using `.AddDeveloperSigningCredential()` to create keys for signing your tokens and you've figured out that this is no good in a production environment. Maybe you've been thinking about generating a certificate yourself and deploy with your app, but that doesn't seem like a good solution since it limits your ability to do key rollover (since you'd have to redeploy your application), it might also seem like a bad idea to read a file from disk in a cloud application. Perhaps you could use Azure blob storage to store the file and make sure that only your application could read it? You'd still have to manually generate the certificate and upload it though. You might have seen a few blog posts suggesting that you use the app service built in certificate store, but you've also seen posts about how it's deprecated and we don't know for how long it'll be around.

The solution to this is to use Azure KeyVault, but information about how to combine it with IdentityServer4 is hard to find, and a lot of posts seem to tell you to pull the certificate from KeyVault and into the app service certificate store, which goes against one of the things that you'd like to solve.

### Setup Key vault

1. The first thing you should do (assuming that you've already set up an app service for the actual application) is to head to [https://portal.azure.com](https://portal.azure.com) and add a KeyVault service (it's in the `Security + Identity category at the time of writing), it requires a name (not important what you name it).

2. When creating you may also add access policies (you could do this later if you want, or if they've changed the UI since the time of writing). You should add a access policy for your app, leave the template field blank, and select your app service as the principal. Select `Get, List, Decrypt, Encrypt, Verify, Sign` as the key permissions, `Get, List` as the secret permissions, and `Get, List` as the certificate permissions.

3. Create a certificate, the name you choose here will be added to your apps configuration later so make sure that it's unique. Set a subject as `CN=something`, I don't think that the value of "something" really matters as we won't be using it. Leaving the rest as default is perfectly fine.

### Setup your app service in Azure Active Directory

1. Add a new application registration for your app service in Azure Active directory, this is needed to give it permission to the key vault service. The name can be anything and the signin URL only has to be a valid (format) URL.

2. Make a note of the `Application ID` of your registered app as we'll need this later.

3. Under `Required permissions`, add `Azure Key Vault` and your app service.

4. Add a new secret under `Keys` and make sure that you save the secret string temporarily as you won't be able to read it again.

### Update your code

1. Add the `Microsoft.Extensions.Configuration.AzureKeyVault` nuget package.

2. In `program.cs` update your `BuildWebHost` code to look something like:

```
public static IWebHost BuildWebHost(string[] args) =>
  WebHost.CreateDefaultBuilder(args)
    .UseContentRoot(Directory.GetCurrentDirectory())
    .UseSetting("detailedErrors", "true")
    .ConfigureAppConfiguration((context, config) =>
    {
      config.SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: false)
        .AddJsonFile("appsettings.Development.json", true)
        .AddEnvironmentVariables();

      var builtConfig = config.Build();

      config.AddAzureKeyVault(
        $"https://{builtConfig["Identity:KeyVault"]}.vault.azure.net/",
        builtConfig["Identity:AzureAd:ClientId"],
        builtConfig["Identity:AzureAd:ClientSecret"]);
    })
    .UseStartup<Startup>()
    .Build();
```

Where `builtConfig["Identity:KeyVault"]` should be the name of your key vault, `builtConfig["Identity:AzureAd:ClientId"]` should contain the Application Id that we save in the Azure AD section, and `builtConfig["Identity:AzureAd:ClientSecret"]` should be the secret string of the key that we created in the AD app registration. Feel free to use other ways of getting these 3 strings into the call to `AddAzureKeyVault()`. Doing this will pull in you certificate into the configuration.

3. In `Startup.cs` edit your call to `ConfigureServices()` to include a modified registration of `AddIdentityServer()`.

```
public void ConfigureServices(IServiceCollection services)
{
  ...

  var identityServiceBuild = services.AddIdentityServer(options =>
  {
      ...
  });
  // We get a hold of the currentEnvirononment as the second argument
  // to the Startup constructor and save it as a private field
  if (_currentEnvironment.IsDevelopment())
  {
    identityServiceBuilder.AddDeveloperSigningCredential();
  }
  else
  {
    var key = Configuration["yourcertificatename"];
    var pfxBytes = Convert.FromBase64String(key);
    var cert = new X509Certificate2(pfxBytes, (string)null, X509KeyStorageFlags.MachineKeySet);
    identityServiceBuilder.AddSigningCredential(cert);
  }

  ...
}
```

`yourcertificatename` is the name of the certificate that we created in the key vault. The reason for setting `X509KeyStorageFlags.MachineKeySet` is that the app would otherwise try and write to a key store that we don't have access to in Azure when creating the X509 certificate locally.

### Done

That should be it. It took quite a bit of headache to get it working and I'd be somewhat surprised if it works on the first try after following this post.

Articles that helped:
- https://docs.microsoft.com/en-us/aspnet/core/security/key-vault-configuration?tabs=aspnetcore2x
- https://docs.microsoft.com/en-us/rest/api/keyvault/about-keys--secrets-and-certificates
- https://blogs.technet.microsoft.com/kv/2016/09/26/get-started-with-azure-key-vault-certificates/