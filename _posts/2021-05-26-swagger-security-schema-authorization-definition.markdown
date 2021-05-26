---
layout: post
title:  "Define security schemas for Swagger UI to try out authenticated endpoints"
date:   2021-05-26 12:08:00
tags: [development,csharp,dotnet,swagger,authentication]
---

You've got an API, it's secured by OAuth using the Client Credentials flow (typically used for server to server communication), and now you want to enable the consumers of your API to try it out in an authenticated way, directly from Swagger. This post is about an API that uses Client Credentials, but it could also be used as a starting point if you want to do the same, but perhaps authenticating end users with the OIDC Authorization code PKCE flow.

This post assumes that:

- You've already setup Swagger using [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle.AspNetCore#getting-started).
- That you have an OAuth client setup in a identity provider somewhere like Okta, Azure AD or a custom Identity Server, and that the client has a allowed scope.
- If you don't have an OAuth client setup, then you may use [Identity server demo](https://demo.identityserver.io/) with the "m2m" client id, as this is using the Client Credentials flow, and it has a allowed scope (`api`).

This means that you probably have a call to `.AddSwaggerGen(...)` in your `ConfigureServices` method in `Startup.cs`. let's see what changes we need to do to get our desired end result.

{% highlight c# %}
public void ConfigureServices(IServiceCollection services)
{
    ...

    services.AddSwaggerGen(c =>
    {
        ...
        var requiredScope = "api";
        var securityDefinitionId = "oath2ClientCredentials";

        var securityScheme = new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = securityDefinitionId },
            Type = SecuritySchemeType.OAuth2,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Flows = new OpenApiOAuthFlows
            {
                ClientCredentials = new OpenApiOAuthFlow
                {
                    TokenUrl = new Uri("https://demo.identityserver.io/connect/token"),
                    Scopes = new Dictionary<string, string>
                    {
                        { requiredScope, "For accessing the API at all" }
                    }
                }
            }
        };

        c.AddSecurityDefinition(securityDefinitionId, securityScheme);
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {securityScheme, new string[] { requiredScope }}
        });
        ...
    });

    ...
}
{% endhighlight %}

Key points:
- This code uses the configuration from the [Identity Server demo](https://demo.identityserver.io/).
    - The `requiredScope` uses the value `api`.
    - The `TokenUrl = new Uri("https://demo.identityserver.io/connect/token")` is the token endpoint in their [Discovery document](https://demo.identityserver.io/.well-known/openid-configuration).
- We're setting a variable `securityDefinitionId`, as we need this in two places.
    - This is because we need to both add the Security Schema (by calling `AddSecurityDefinition`), and then say that the schema is used by all our endpoints by calling `AddSecurityRequirement`. If you want to know more about this, and how to create security schemas that only apply to some endpoints, then have a look at [Swagger Authentication](https://swagger.io/docs/specification/authentication/).
- We're saying that this is using the Client Credentials flow by setting `Type = SecuritySchemeType.OAuth2`, `Scheme = "bearer"`, `BearerFormat = "JWT"`, and then defining the ClientCredentials flow. This is the basic configuration for using Client Credentials, but if you're perhaps using a different `BearerFormat`, then change the configuration accordingly.
- You may define multiple scopes (any and all scopes you've defined in your identity provider) in the `Scopes = ` property. This will enable you to select some, or all of them when authenticating, in order to test endpoints that require different scopes, although we've only got a single scope (`api`) in this example.
- The `{securityScheme, new string[] { requiredScope }}` in `.AddSecurityRequirement`, tells Swagger that all our endpoints uses our Security Schema, and that they all require the scope `api`.
- I'm connecting the Security Schema to the Security Requirements a bit differently than in [the documentation](https://github.com/domaindrivendev/Swashbuckle.AspNetCore#add-security-definitions-and-requirements) by moving the `Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "oauth2" }` from `.AddSecurityRequirement()` directly into our `securityScheme`.
- The `new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = securityDefinitionId }` uses our `securityDefinitionId` for its `Id` property, but in the call to `.AddSecurityDefinition()`, `securityDefinitionId` is used for the `name` parameter, this is as expected though.

After we've done this, then we will find that the following has been added to our `swagger.json`:
{% highlight json %}
{
  ...
  "components":
    "securitySchemes": {
      "oauth2ClientCredentials": {
        "type": "oauth2",
        "flows": {
          "clientCredentials": {
            "tokenUrl": "https://demo.identityserver.io/connect/token",
            "scopes": {
              "api": "For accessing the API at all"
            }
          }
        }
      }
    }
  },
  "security": [
    {
      "oauth2ClientCredentials": [
        "api"
      ]
    }
  ]
  ...
}
{% endhighlight %}

And that you've got a pretty green button with the text "Authorize" near the top of the page when you access /swagger/index.html, which displays the following when triggered, and allows you to authenticate using Client Credentials. If you're using [Identity server demo](https://demo.identityserver.io/) to try this out, then you may use the `client_id: m2m` and `client_secret: secret`, if this doesn't work, then check on [Identity server demo](https://demo.identityserver.io/) if they've changed the credentials for the Client Credentials flow client.

![Screenshot of the Authorize popup when viewing the Swagger UI](/media/SwaggerAuthorize.png)


## Resources used when finding this solution
- [Identity server demo](https://demo.identityserver.io/)
- [Add Security Definitions and Requirements](https://github.com/domaindrivendev/Swashbuckle.AspNetCore#add-security-definitions-and-requirements)
- [How securityDefinition and securityRequirement relates](https://swagger.io/specification/#securityRequirementObject)
- [API Security in Swagger](https://codeburst.io/api-security-in-swagger-f2afff82fb8e)

## Versions used
- .NET core 3.1
- Swashbuckle.AspNetCore 6.1.4
- Swashbuckle.AspNetCore.Annotations 6.1.4