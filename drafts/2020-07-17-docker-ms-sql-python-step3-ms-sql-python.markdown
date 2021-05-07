---
layout: post
title:  "Using MS SQL Server with Python and Docker: MS SQL with Python"
date:   2020-07-17 14:08:00
tags: [development,sql server, docker, python]
---

## Problem
I have a function that should trigger a `callback`, `lambda`, `Func`, `Action` (or any other name that your language of choice might use for this concept).
I also want to write a test to make sure that my function trigger this `callback` under certain conditions.
The least invasive way I could think of to test this is to declare a variable in my test, and supply a `callback` that sets this variable when triggered.

Example code:

{% highlight python %}

def __trigger_callback(callback: Callable[[], None]) -> None:
    callback()

def test_trigger():
    triggered = False

    def fetcher():
        triggered = True

    __trigger_callback(fetcher)

    assert triggered == True
    
{% endhighlight %}

As a JS and C# dev I would assume that this test would succeed as both of these languages will bind the variable name in the inner scope `fetcher.triggered` to the one defined in the outer scope `test_trigger.triggered`.
This is not the case however, as python will create a new variable that is bound to the local scope, and the test will fail since the outer variable is never reassigned.

## Solution
The solution to this is to use the `nonlocal` keyword, which will bind the local name to the outer variable.

{% highlight python %}

def test_succeeds_because_of_nonlocal_rebinding():
    triggered = False

    def fetcher():
        nonlocal triggered;
        triggered = True

    __trigger_callback(fetcher)

    assert triggered == True

{% endhighlight %}

## Usecase
I was building a self filling cache that would take a reference to a database fetching function, that it would trigger in the case of not finding the requested key in the cache.

## Resources used when finding this solution
- [https://stackoverflow.com/questions/5218895/python-nested-functions-variable-scoping](https://stackoverflow.com/questions/5218895/python-nested-functions-variable-scoping)
- [https://docs.python.org/3/reference/simple_stmts.html#grammar-token-nonlocal-stmt](https://docs.python.org/3/reference/simple_stmts.html#grammar-token-nonlocal-stmt)
