---
layout: post
title:  "Set GraphQL operation name in Application Insights"
date:   2019-02-10 14:12:00
tags: [development,azure,graphql,dotnetcore,dotnet,applicationinsights]
---

You've setup your new dotnet core application, added [https://github.com/graphql-dotnet/graphql-dotnet](https://github.com/graphql-dotnet/graphql-dotnet), and created a graph and some mutations.

You deploy it to Azure, add Application Insights, and start to onboard users.

When you have a look at it, this is what you see:

![Screenshot of Application Insight with a single operation for GraphQL](/media/graphql-applicationinsights-grouped.png)

This is because the default setup of Application insights will log http requests with the endpoint as the operation, which doesn't help us in the case of GraphQL is everything is routed to the same endpoint.

There are a couple of ways of addressing this:
- Add custom metrics to the operation, allowing you to drill down and inspect individual queries.
- Group queries as separate operations.

My choice was to separate queries into operations, one of the reasons for doing this is that we're immature users of Application Insights, we don't have any complex views, our business people look at the default view in the Azure portal and draw conclusions from that. Having them as separate operations allow them to get a better understanding of the performance of the application.

One of the major points of GraphQL is the ability to tailor a query to the calling clients needs, meaning that they're all potentially unique. Then how do we group these queries? What I came up with is to primarily use a hash of the actual query, which makes sure that identical queries from different clients are still grouped. I also add the GraphQL query/mutation name to the operation name, in case the query is named. This breaks the grouping of identical queries in case different clients use the same query but name them differently, but in our case we have one major client that represents 95% of all the requests.




========================================

## The code

All the code that we need to change (to get this to work, if you have any custom authorization then you might need to change that as well) is in the `public void ConfigureServices(IServiceCollection services)` method of our `Startup.cs` file.

Before we start adding the new `idp` (identity provider, Auth0 in this case) our `ConfigureServices` look something like this:
{% highlight c# %}
public void ConfigureServices(IServiceCollection services)
{
    // Here we add the bare minimum for validating tokens against our Azure AD.
    // The application would retrieve a token from Azure AD (in our app, through the implicit flow)
    // with the resource parameter set to the application id for the registration of this API in Azure AD.
    // (the same id specified in validaudiences), this will set the aud claim of the token to the correct id,
    // which is what the "AddJwtBearer" middleware will check against.
    services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(o =>
        {
            //Identify the identity provider
            o.Authority = "https://login.microsoftonline.com/{The tenant/directory id of your Azure AD}";

            // We use this for retrieving more data about the user.
            // But this is optional depending on your use case.
            o.SaveToken = true;

            o.TokenValidationParameters = new TokenValidationParameters
            {
                //Both the client id and app id URI of this API should be valid audiences
                ValidAudiences = new List<string> { "{The applicationid of your api registration in Azure AD}" }
            };
        });

    services.AddAuthorization(options =>
        {
            // You might add this as a default policy but we're using this as a base for other policies as well.
            var apiPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();
            options.AddPolicy("Api", apiPolicy);
        });
}
{% endhighlight %}

With this code we have an API that will accept tokens from AAD with the `aud` claim set to the application id for the API when registered in AAD (it's up to the calling application to specify that the requested token is for this API).

Now we will need to make some small changes to be able to accept either a AAD OR Auth0 token.

{% highlight c# %}
public void ConfigureServices(IServiceCollection services)
{
    services
        .AddAuthentication("aad")
        .AddJwtBearer("aad", o =>
        {
            //Identify the identity provider
            o.Authority = "https://login.microsoftonline.com/{The tenant/directory id of your Azure AD}";

            // We use this for retrieving more data about the user.
            // But this is optional depending on your use case.
            o.SaveToken = true;

            o.TokenValidationParameters = new TokenValidationParameters
            {
                //Both the client id and app id URI of this API should be valid audiences
                ValidAudiences = new List<string> { "{The applicationid of your api registration in Azure AD}" }
            };
        })
        .AddJwtBearer("auth0", o =>
        {
            //Identify the identity provider
            o.Authority = "https://{the tenant id of your Auth0 tenant}.eu.auth0.com";

            // We use this for retrieving more data about the user.
            // But this is optional depending on your use case.
            o.SaveToken = true;

            o.TokenValidationParameters = new TokenValidationParameters
            {
                //Both the client id and app id URI of this API should be valid audiences
                ValidAudiences = new List<string> { "{The Audience of your Auth0 API registration}" }
            };
        });

    services.AddAuthorization(options =>
        {
            // You might add this as a default policy but we're using this as a base for other policies as well.
            var apiPolicy = new AuthorizationPolicyBuilder("aad", "auth0")
                .AddAuthenticationSchemes("aad", "auth0")
                .RequireAuthenticatedUser()
                .Build();
            options.AddPolicy("Api", apiPolicy);
        });
}
{% endhighlight %}

As you can see we've added another call to `AddJwtBearer` which as identical to the first call, except for the values of the properties. You might also see that we've used the named `AddJwtBearer` overload which is necessary to be able to use both of them, otherwise the last call would "win" and only that registration would actually be checked against. This also allows us to add different `idps` to different policies, for instance to only allow one `idp` to a admin endpoint but everyone to all the normal endpoints, but in our case we add both `idps` to our "Api" policy. It should be possible to add them to either the `new AuthorizationPolicyBuilder` constructor, or to the `AddAuthenticationSchemes` call, but I've only gotten it to work by adding it to both.

The last thing we do is to set our "default" `idp` name in the call to `AddAuthentication`.

## Things you might need

If you have the need to somewhat normalize the user information from multiple `idps`, for instance if you use the `User.Identity.Name` in a controller, then you may use the `OnTokenValidated` event to controll how the `idp` token claims flow into your `ClaimsIdentity`.

{% highlight c# %}
.AddJwtBearer("auth0", o =>
{
    ...
    o.Events = new JwtBearerEvents
    {
        OnTokenValidated = async ctx =>
        {
            // Mock call to Auth0 UserInfo endpoint to retrieve more information for the user
            // then what's contained in the access_token (the userinfo endpoint serve the same info that an id_token contains)
            var userInfo = await userInfoProvider.Get((JwtSecurityToken)ctx.SecurityToken);
            ((ClaimsIdentity)ctx.Principal.Identity).AddClaim(new Claim(ClaimTypes.Name, userInfo.Email));
        }
    };
})
{% endhighlight %}


## Resources used when finding this solution
- [https://github.com/aspnet/Security/issues/1708#issuecomment-376567491](https://github.com/aspnet/Security/issues/1708#issuecomment-376567491)
- [https://github.com/aspnet/Security/issues/1664](https://github.com/aspnet/Security/issues/1664)
- [https://stackoverflow.com/questions/49694383/use-multiple-jwt-bearer-authentication](https://stackoverflow.com/questions/49694383/use-multiple-jwt-bearer-authentication)
- [https://joonasw.net/view/adding-custom-claims-aspnet-core-2](https://joonasw.net/view/adding-custom-claims-aspnet-core-2)
- [https://github.com/aspnet/Security/issues/1310](https://github.com/aspnet/Security/issues/1310)
