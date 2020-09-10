---
layout: post
title:  "Shared variables in docker-compose.yml"
date:   2020-09-10 12:29:00
tags: [development,docker, yaml]
---

This post started out as me trying to solve a fairly straight forward problem (stated below), but instead fell into the rabbit hole of YAML structure and concepts.

## Problem
I've got a docker-compose setup for running an app locally, it consists of one database service, and one api service.

It basically looks like this:
{% highlight yaml %}
version: '3'

services:
  database:
    ...
    container_name: {static-name-of-our-database-container}
    environment:
      - ...
      - SA_PASSWORD={secret-password}
  api:
    ...
    depends_on:
      - database
    environment:
      - ...
      - DB_USER_PASSWORD={secret-password}
      - DB_HOST={static-name-of-our-database-container}
{% endhighlight %}

You can probably already guess the issue, I'm using the same literal password in 2 places, and I use the name of the database container as the database host for the api (also literals). For 2 services in a contrived example this might be alright, but to me, typing out the same value more than once spells trouble down the road, better to fix it now!

## Solution
I want to be able to declare my 2 variables once, and use them twice.

Turns out that we're able to accomplish this in multiple ways using concepts from both YAML and docker-compose.
- YAML Anchors and aliases: [https://yaml.org/spec/1.2/spec.html#id2765878](https://yaml.org/spec/1.2/spec.html#id2765878)
- docker-compose extension fields (requires docker-compose.yml version 3.4+): [https://docs.docker.com/compose/compose-file/#extension-fields](https://docs.docker.com/compose/compose-file/#extension-fields)

Let's try a few scenarios to see how we may combine these concepts to solve different problems:

### Reuse a scalar value, but rename the mapping (the problem stated at the beginning)
In this case I'd argue that the `database` service "owns" the values for both the container name, and the password. This means that we may declare the values as anchors (identified by a `&` character) at the same position that they are right now, and then output them as alias (identified by a `*` character).

Our docker-compose.yml file would then look like this:

{% highlight yaml %}
version: '3'

services:
  database:
    ...
    container_name: &database-container-name mycontainername
    environment:
      ...
      SA_PASSWORD: &sa-password reallysecretpassword
  api:
    ...
    depends_on:
      - database
    environment:
      ...
      DB_USER_PASSWORD: *sa-password
      DB_HOST: *database-container-name
{% endhighlight %}

Which would result in the following environment variables on the `api` service:

{% highlight yaml %}
environment:
  DB_USER_PASSWORD: reallysecretpassword
  DB_HOST: mycontainername
{% endhighlight %}

You might notice that I changed the syntax in both `environment` mappings block from using the `- {key}={value}` syntax, to use the `{key}: {value}` syntax. That's because the first one isn't proper syntax, but works, atleast until we started to add the anchors and aliases, at which point it breaks.

### Reuse an entire block/sequence
Lets say that we have an application where 2 clients communicate with the same backend, then we might want to have the same environment variables in both of these in order to communicate with the api.

In this case we might declare an anchor for the entire block:

{% highlight yaml %}
services:
  api:
    ...
    environment:
      &api-configuration
      hostname: {host}
      apikey: {apikey}
  client1:
    environment: *api-configuration
  client2:
    environment: *api-configuration
{% endhighlight %}

Here the environment variables for both `client1` and `client2` will be exactly what's in the `&api-configuration` anchor.

This could be useful in some instances, but probably not in this one so let's continue on.

### Merge blocks/sequences [spec](https://yaml.org/type/merge.html)
In the above example we're limited to having `client1` and `client2`'s environment variables to be exactly the same as the `api`'s. But what if `client1` and `client2` have other variables that the `api` doesn't have? And what if these variables aren't common between `client1` and `client2`? Let's instead merge the `api` `environment` variables into each respective client.

{% highlight yaml %}
services:
  api:
    ...
    environment:
      &api-configuration
      hostname: {host}
      apikey: {apikey}
  client1:
    environment: 
      <<: *api-configuration
      uniquekey: uniquevalue
  client2:
    environment:
      <<: *api-configuration
      uniquekey2: uniquevalue2
{% endhighlight %}

Here we use the `<<` merge type to merge the `&api-configuration` into each respective clients `environment` variables. If you want to read up on the exact merge rules then check out the [Specification](https://yaml.org/type/merge.html)

The output from this would be:

{% highlight yaml %}
services:
  api:
    ...
    environment:
      hostname: {host}
      apikey: {apikey}
  client1:
    environment: 
      hostname: {host}
      apikey: {apikey}
      uniquekey: uniquevalue
  client2:
    environment:
      hostname: {host}
      apikey: {apikey}
      uniquekey2: uniquevalue2
{% endhighlight %}

### Extension fields [spec](https://docs.docker.com/compose/compose-file/#extension-fields)
Building on the above example, let's say that our `api` doesn't actually know its own hostname (at least not through this configuration), how do we avoid getting that variable into its `environment` variables?

In this case I'd break common blocks into extension fields (docker-compose specific, requires version 3.4+ of docker-compose.yml):

{% highlight yaml %}

x-common-extensions
  &common
  apikey: {apikey}

x-client-common-extensions
  &client-common
  <<: *common
  hostname: {host}

services:
  api:
    ...
    environment:
      <<: *common
  client1:
    environment: 
      <<: *client-common
      uniquekey: uniquevalue
  client2:
    environment:
      <<: *client-common
      uniquekey2: uniquevalue2
{% endhighlight %}

We've now defined the `x-common-extensions` (with the anchor name `&common`), and the `x-client-common-extensions` (with the anchor name `&client-common`) extensions. The name of the extensions themselves aren't important (not used by us), except that they have to start with `x-`. Using this you're able to create a hierarchy of commom blocks. If you favor single level composition over the hierarchy, then you may achieve the same end result with the following:

{% highlight yaml %}

x-common-extensions
  &common
  apikey: {apikey}

x-client-common-extensions
  &client-common
  hostname: {host}

services:
  api:
    ...
    environment:
      <<: *common
  client1:
    environment: 
      <<: *common
      <<: *client-common
      uniquekey: uniquevalue
  client2:
    environment:
      <<: *common
      <<: *client-common
      uniquekey2: uniquevalue2
{% endhighlight %}

The difference here is that we've moved the merge from `&common` into `&client-common`, and put multiple merges into the clients environment blocks instead.

The end result will be the same, namely:

{% highlight yaml %}
services:
  api:
    ...
    environment:
      apikey: {apikey}
  client1:
    environment: 
      hostname: {host}
      apikey: {apikey}
      uniquekey: uniquevalue
  client2:
    environment:
      hostname: {host}
      apikey: {apikey}
      uniquekey2: uniquevalue2
{% endhighlight %}

### Scalar value as a extension field
Let's say that we want to have the `hostname` in the `api` `environment` variables anyway, but we want it to have a different key, how could we do that?

One way would be to define that value as an extension field on it's own, not as part of a block, something like this:

{% highlight yaml %}

x-hostname &hostname {host}

x-common-extensions
  &common
  apikey: {apikey}

x-client-common-extensions
  &client-common
  <<: *common
  hostname: *hostname

services:
  api:
    ...
    environment:
      <<: *common
      customhostnamekey: *hostname
  ...
{% endhighlight %}

With the end result:

{% highlight yaml %}
services:
  api:
    ...
    environment:
      ...
      customhostnamekey: {host}
  client1:
    environment: 
      hostname: {host}
      ...
  client2:
    environment:
      hostname: {host}
      ...
{% endhighlight %}

## Conclusion
Finding out how to do this wasn't too straight forward, it did take a bit of digging, especially finding the concept of anchors/alias, hopefully this might help someone trying to accomplish something similar.

This post has focused on the `environment` block. But anchors/alias are possible to use in any place in any yaml definition (atleast ones that are parsed by a 1.2+ parser), and docker-compose extension fields are possible to use anywhere in your service definitions.

## Resources used when finding this solution
- [The first stackoverflow post that exposed me to the concepts](https://stackoverflow.com/questions/36283908/re-using-environmental-variables-in-docker-compose-yml)
- [Stack overflow that explains scalar anchors](https://stackoverflow.com/questions/39282485/can-i-anchor-individual-items-in-a-yaml-collection)
- [Very good post that explained most of this to me](https://medium.com/@kinghuang/docker-compose-anchors-aliases-extensions-a1e4105d70bd)
- [Extension fields specification](https://docs.docker.com/compose/compose-file/#extension-fields)
- [Good overview of yaml structure](https://www.tutorialspoint.com/yaml/yaml_collections_and_structures.htm)