---
layout: post
title:  "Secure your Swagger endpoints using basic authentication"
date:   2021-05-25 19:28:00
tags: [development,csharp,dotnet,swagger,authentication]
---

What are we trying to do? We're trying to lock down our Swagger endpoints (index.html, swagger.json) in order to disallow unauthenticated users from reading our documentation.

Why would I want to do this? Perhaps you're building a internal API, or an API that should only be available to a few consumers where it's not important for you to differentiate between them. If this applies to you, then it's also a nice perk that basic authentication is built into browsers and will trigger a authentication popup, without you needing to supply any UI, or use third-party services.

Well, turns out there isn't anything built in for doing exactly this, but it doesn't require too much code to get it in place. In my example I'll show how to use a single credential taken from a configuration, but it should be easy enough to modify to use other forms of user stores. If you want to do something similar but use OIDC instead of basic authentication (which you'd probably want if you're having multiple users authenticating against the documentation), then I'd recommend [this blog post](https://blog.devgenius.io/csharp-protecting-swagger-endpoints-82ae5cfc7eb1). I also used [this blog](https://jasonwatmore.com/post/2019/10/21/aspnet-core-3-basic-authentication-tutorial-with-example-api) when looking up how to do basic authentication in dotnet core, as there isn't a built in handler for this.

The key points of implementing basic authentication for Swagger are basically:
- Create a basic authentication handler.
- Register a AuthenticationSchema that uses this handler.
- Use `.UseEndpoints()` middleware to intercept the Swagger endpoints, and make sure that they use the AuthenticationSchema above.

Let's look at the code:

`Startup.cs` (I'm assuming that your `Startup.cs` looks like [this one](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup?view=aspnetcore-3.1#the-startup-class)) and that you've setup Swagger using [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle.AspNetCore#getting-started)

`ConfigureServices`
{% highlight c# %}
public void ConfigureServices(IServiceCollection services)
{
    ...

    services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        authenticationBuilder.AddScheme<StaticCredentialsBasicAuthenticationhandlerOptions, StaticCredentialsBasicAuthenticationhandler>("SwaggerBasic", options =>
        {
            options.UserName = Configuration["Swagger:Username"];
            options.Password = Configuration["Swagger:Password"];
            options.Realm = "Swagger";
        });

    ...
}
{% endhighlight %}

Key points:
- We're adding the AuthenticationSchema to our services, making it possible for our middlewares to trigger authentication using it.
- We're picking out the credentials from our `Configuration`, this is fine if you only want to secure it for minor use/consumers. You should probably modify this to use some form of identity/credential management if you have multiple users accessing this.
- If you want to read up on the `Realm` option, then you may have a look [here](https://httpwg.org/specs/rfc7617.html#rfc.section.2).
- We will soon look at the implementation behind `StaticCredentialsBasicAuthenticationhandler`.

`Configure`
{% highlight c# %}
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    ...

    app
        ...
        .UseAuthentication()
        .UseRouting()
        .UseAuthorization()
        .UseSwagger()
        .UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API");
        })
        .UseEndpoints(endpoints =>
        {
            ...

            var pipeline = endpoints.CreateApplicationBuilder().Build();
            var basicAuthAttr = new AuthorizeAttribute { AuthenticationSchemes = "SwaggerBasic" };
            endpoints
                .Map("/swagger/{documentName}/swagger.json", pipeline)
                .RequireAuthorization(basicAuthAttr);
            endpoints
                .Map("/swagger/index.html", pipeline)
                .RequireAuthorization(basicAuthAttr);

            ..
        });

    ...
}
{% endhighlight %}

Key points:
- If you've already setup Swashbuckle, then the biggest changes here are probably the additions of `.UseAuthentication()`, `.UseAuthorization()`, and `.UseEndpoints(...)`.
- `"/swagger/{documentName}/swagger.json"`, this mapping relies on you having something similar to this `c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API")` line, if you're using another pattern, then change the endpoint mapping accordingly.
- What we're doing in `.UseEndpoints(...)` is that we're mapping the swagger endpoints, that are already mapped in `.UseSwagger()` and `.UseSwaggerUI(...)`, effectively adding the `.RequireAuthorization()` to them, and make sure that it requires authentication using our schema.
- `AuthenticationSchemes = "SwaggerBasic"` uses the same schema name as we used in `.AddScheme` in `ConfigureServices`.
- `.UseAuthorization()` must come before `.UseSwagger()` and `.UseSwaggerUI()`, which must come before `.UseEndpoints()`.

Now we're ready to look at the `StaticCredentialsBasicAuthenticationhandler`.

`StaticCredentialsBasicAuthenticationhandler.cs`
{% highlight c# %}
public class StaticCredentialsBasicAuthenticationhandlerOptions : AuthenticationSchemeOptions
{
    public string UserName { get; set; }
    public string Password { get; set; }
    public string Realm { get; set; }
}
public class StaticCredentialsBasicAuthenticationhandler : AuthenticationHandler<StaticCredentialsBasicAuthenticationhandlerOptions>
{
    public StaticCredentialsBasicAuthenticationhandler(
        IOptionsMonitor<StaticCredentialsBasicAuthenticationhandlerOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock) : base(options, logger, encoder, clock)
    { }

    protected override async Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.Headers["WWW-Authenticate"] = $"Basic realm=\"{Options.Realm}\", charset=\"UTF-8\"";
        await base.HandleChallengeAsync(properties);
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.ContainsKey("Authorization"))
            return Task.FromResult(AuthenticateResult.Fail("Missing Authorization Header"));

        try
        {
            var authHeader = AuthenticationHeaderValue.Parse(Request.Headers["Authorization"]);
            var credentialBytes = Convert.FromBase64String(authHeader.Parameter);
            var credentials = Encoding.UTF8.GetString(credentialBytes).Split(new[] { ':' }, 2);
            var username = credentials[0];
            var password = credentials[1];

            if (username.ToLower().Equals(Options.UserName.ToLower()) && password.Equals(Options.Password))
            {
                var identity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, username) }, Scheme.Name);
                var principal = new ClaimsPrincipal(identity);
                var ticket = new AuthenticationTicket(principal, Scheme.Name);
                return Task.FromResult(AuthenticateResult.Success(ticket));
            }
            return Task.FromResult(AuthenticateResult.Fail("Invalid username or password"));
        }
        catch
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid Authorization Header"));
        }
    }
}
{% endhighlight %}

Key points:
- `HandleChallengeAsync`, this will trigger when anything after it in the pipeline (that uses the same AuthenticationSchema, registered in `Startup.cs`) returns a 401 or 403 status code. For instance, if `HandleAuthenticateAsync` fails.
- `HandleAuthenticateAsync`, the flow here is basically:
    1. Check if the client is sending in an `Authorization` header, if not, fail, effectively sending us to `HandleChallengeAsync`.
    1. Decode the Base64 string that's the value of the `Authorization` header.
    1. Validate the username/password that we got from the header. if incorrect, fail it.
    1. Construct an authentication ticket that will be used by the rest of the pipeline (populating) `ClaimsPrincipal User` on your controllers for instance, this is something that we aren't using in this case though, as we're only interested in letting someone reach the Swagger documentation, or not.
    1. Call success using this authentication ticket, thus authenticating the caller.

## Resources used when finding this solution
- [How to restrict access to swagger/* folder?](https://github.com/domaindrivendev/Swashbuckle.WebApi/issues/384) (the main issue that's being linked to when trying to find out how to protect a swagger endpoint).
- [How to protect swagger endpoint in .NET Core API?](https://stackoverflow.com/a/63763709)
- [Securing Swagger with OIDC](https://blog.devgenius.io/csharp-protecting-swagger-endpoints-82ae5cfc7eb1)
- [Basic authentication with dotnet core](https://jasonwatmore.com/post/2019/10/21/aspnet-core-3-basic-authentication-tutorial-with-example-api)
- [Overview of ASP.NET Core authentication](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-3.1)

## Versions used
- .NET core 3.1
- Swashbuckle.AspNetCore 6.1.4
- Swashbuckle.AspNetCore.Annotations 6.1.4