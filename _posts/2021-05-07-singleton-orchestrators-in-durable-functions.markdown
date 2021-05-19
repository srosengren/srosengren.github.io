---
layout: post
title:  "Singleton orchestrators in Durable Functions"
date:   2021-05-07 16:58:00
tags: [development,csharp,dotnet,azure,functions, durable]
---

The [Durable Functions documentation](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-singletons?tabs=csharp) describes one way of doing this, this does however not fit every use case where you might need to run a orchestrator function as a singleton.

## Actual real life problem
I've got an orchestrator that triggers every 5 minutes, however, at times the execution of this orchestration runs for longer than the 5 minutes until the next invocation. In this case I would like it to not run, and continue on as normal in the next 5 minute intervall when there isn't already an instance of it running.

This is something that the proposed solution in the docs cover. It does however not account for me wanting each execution of the orchestrator to be uniquely identifiable. This breaks since the proposed solution is to set the instance id of each execution to be the same id. Which, at least for me, breaks logging with Application Insights (correlation in logging when using Durable Functions is its own topic).

TLDR:
- I only want a single instance of a specific orchestration to run at the same time.
- I want each instance to have a unique ID.

## Solution
I stumbled across this while searching for how to correlate log entries in Application Insights between orchestrations and their spawned functions. [ListInstancesAsync](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.webjobs.extensions.durabletask.idurableorchestrationclient.listinstancesasync?view=azure-dotnet) takes an [OrchestrationStatusQueryCondition](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.webjobs.extensions.durabletask.orchestrationstatusquerycondition?view=azure-dotnet) which has the property [InstanceIdPrefix](https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.webjobs.extensions.durabletask.orchestrationstatusquerycondition.instanceidprefix?view=azure-dotnet#Microsoft_Azure_WebJobs_Extensions_DurableTask_OrchestrationStatusQueryCondition_InstanceIdPrefix) which does pretty much what I'd like. It allows me to create unique instance ids (with a prefix), and then query for that prefix to make sure that there are no instances running.

What does it look like? Well, something like this:

Let's use the example for running an orchestrator as a singleton [from the docs](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-singletons?tabs=csharp#singleton-example) and change it to use this method instead.


{% highlight c# %}
[FunctionName("HttpStartSingle")]
public static async Task<HttpResponseMessage> RunSingle(
    [HttpTrigger(AuthorizationLevel.Function, methods: "post", Route = "orchestrators/{functionName}/{instanceIdPrefix}")] HttpRequestMessage req,
    [DurableClient] IDurableOrchestrationClient starter,
    string functionName,
    string instanceIdPrefix,
    ILogger log)
{
    // Check if an running instance with the specified ID prefix exists.
    var existingInstances = await starter.ListInstancesAsync(new OrchestrationStatusQueryCondition
        {
            InstanceIdPrefix: instanceIdPrefix,
            RuntimeStatus = new OrchestrationRuntimeStatus[]
            {
                OrchestrationRuntimeStatus.Pending,
                OrchestrationRuntimeStatus.Running,
                OrchestrationRuntimeStatus.ContinuedAsNew
            }
        }, System.Threading.CancellationToken.None);

    if (!existingInstances.Any())
    {
        // An instance with the specified ID prefix doesn't exist or an existing one stopped running, create one.
        dynamic eventData = await req.Content.ReadAsAsync<object>();
        var instanceId = await starter.StartNewAsync(functionName, $"{instanceIdPrefix}_{Guid.NewGuid(), eventData);
        log.LogInformation($"Started orchestration with ID = '{instanceId}'.");
        return starter.CreateCheckStatusResponse(req, instanceId);
    }
    else
    {
        // An instance with the specified ID prefix exists or an existing one still running, don't create one.
        return new HttpResponseMessage(HttpStatusCode.Conflict)
        {
            Content = new StringContent($"An instance with ID prefix '{instanceIdPrefix}' already exists."),
        };
    }
}
{% endhighlight %}

What did we change?
- We changed the route to include `{instanceIdPrefix}` instead of `{instanceId}`, which in turn makes the function get a `instanceIdPrefix` parameter instead of the `instanceId`.
- We change the `existingInstance` variable to be `existingInstances`, and instead of fetching the status for a single instance id, we search for the `instanceIdPrefix` and statuses that we're interested in. We're interested in the `Pending`, `Running`, and `ContinuedAsNew` statuses, as thos are the ones that may be interpreted as "this instance is running, or about to run".
- We run `StartNewAsync` with the concatenation of our `instanceIdPrefix` and any instance specific string we want, in this case just a guid.
- We capture the `instanceId` returned from `StartNewAsync`, and return the response from calling `CreateCheckStatusResponse`, just as the original example.

## Versions used
- .NET core 3.1
- Microsoft.Azure.WebJobs.Extensions.DurableTask v2.4.3