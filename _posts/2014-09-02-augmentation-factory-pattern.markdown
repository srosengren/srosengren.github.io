---
layout: post
title:  "Augmentation factory pattern"
date:   2014-09-02 10:50:00
tags: [patterns,factory,javascript,c#]
---

The augmentation factory pattern is an extension of the normal factory pattern when working with dynamic languages. It can be thought of as a way to get interfaces into javascript, or a way to deal with inheritance without using any actual inheritance. I do not find it helpful when working with class based languages but I do use it extensively when writing javascript.

###Normal factory pattern
I'm a big fan of the factory method pattern and I use it a lot when writing c# code. I find that it helps me with Interface based architectures as I can move logic for the creation of objects out of constructors and into a method that can be used to instantiate different implementations of a specific interface, without them having to share a base class, which I find is good for code reuse in most cases.

####The most basic example
{% highlight c# %}
public class Car
{
  public string Manufacturer { get; set; }

  //Factory method
  public static Car Make()
  {
    return new Car();
  }
}

Car c = Car.Make();
{% endhighlight %}

[Wikipedia](http://en.wikipedia.org/wiki/Factory_method_pattern) has a more extensive explanation of the factory pattern with code examples for java,php and c#.

###Augmentation factory pattern
What I use the augmentation factory pattern for mostly is to fake interfaces/multiple inheritance into javascript. 

####A basic example
{% highlight javascript %}
var phoneAble = {
  make: function(objectToAugment){
    objectToAugment = objectToAugment || {};
    objectToAugment.phoneNumber = '';
    objectToAugment.call = function(phoneNumber){
        alert('calling ' + phoneNumber + ' from ' + objectToAugment.phoneNumber);
    }
    return objectToAugment;
  }
};

//Create a new phoneable object
var myPhoneableObject = phoneAble.make();

//Make an existing object phoneable
var myExistingObject = {
	name: 'test'
};
phoneAble.make(myExistingObject);
{% endhighlight %}

In this example I've created a factory called `phoneAble` that can either work like a normal factory method by calling it without any argument, or as a augmentation factory by calling it with an existing object as a single argument. What's important here is the first line of the factory `objectToAugment = objectToAugment || {}` that makes sure that we always have a object to work on and return from the factory. Calling at as a augmentation factory will modify the existing object and because of that we won't have to assign it to a variable since we already have a reference.

####Extendability (interface/multi inheritance)
We can now create other factories that internally uses our phoneAble factory.
{% highlight javascript %}
var company = {
  make: function(objectToAugment){
    objectToAugment = objectToAugment || {};
    phoneAble.make(objectToAugment);
    objectToAugment.phoneNumber = 321;
    
    return objectToAugment;
  }
};

var person = {
  make: function(objectToAugment){
    objectToAugment = objectToAugment || {};
    phoneAble.make(objectToAugment);
    objectToAugment.phoneNumber = 123;
    
    return objectToAugment;
  }
};
{% endhighlight %}
We might say that objects created by these factories also "implements" phoneAble. We can argue that this example could be implemented through regular inheritance via prototyping. But phoneAble is not what I would call a "baseclass" since it's just a functionality container, and it might be one of many that we would like to apply to objects from a certain factory (type). This to could be solved by creating a intricate system of inheritance where each level provided the requested functionality, but this isn't feasible in a large scale application to me as my experience tells me that it takes a lot of effort both to maintain and to add new types.

####Collisions?
This is a issue that might present itself in a larger application with several chained factories. We will eventually have factories that augment with the same members. This isn't much of an issue for simple properties as this can be solved like this:
{% highlight javascript %}
var phoneAble = {
  make: function(objectToAugment){
    objectToAugment = objectToAugment || {};
    //Make sure that we don't override existing properties
    objectToAugment.phoneNumber = objectToAugment.phoneNumber ||'';
    return objectToAugment;
  }
};
{% endhighlight %}

But it might prove a real issue with functions as each factory expects the methods that it calls to be the implementation that it chose. There is no solution for this for public methods, but neither is there in c# as you can only have one implementation for each member name. What we can do is make sure that only public methods are augmented on to the object and keep the rest private in the factory closure.

{% highlight javascript %}
var phoneAble = {
  make: function(objectToAugment){
    objectToAugment = objectToAugment || {};
	  
    var privateFunction = function(){};
    objectToAugment.publicFunction = function(){
    	//call private method
    	privateFunction();
    }

    return objectToAugment;
  }
};
{% endhighlight %}

###Conclusion
I use this pattern most of the time when I write javascript, it helps me avoid moving logic into constructors functions and adds to code reuse as I can build reusable code components (implemented interfaces). These are my experiences with it and your mileage may vary.