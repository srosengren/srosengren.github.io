---
layout: post
title:  "Javascript objects are hashmaps, how to clone and/or merge them"
date:   2014-09-30 22:10:00
tags: [javascript,arguments,prototype,object,hashmap,dictionary]
---

I love javascript, I really do. One of the things i really enjoy about the language is its dynamic nature where objects are actually hashmaps, associate arrays, dictionaries, or whatever you want to call it. This gives us the ability to get and assign properties using indexing and property names instead of the dot syntax used in most languages (but we can use that to), we can also enumerate over an objects properties which is key to what this post is about.

Example
{% highlight javascript %}
var o = {};

//The property test now contains the text "test"
o.test = 'test'; 

//The property test now contains the text "tset"
o['test'] = 'tset'; 

//We can add new properties, 
//just as we do with the dot syntax
o['test2'] = 'test2';

//We can even use integers
o[1] = 1; 

//But trying to get it out using dot syntax throws 
//"Uncaught SyntaxError: Unexpected number"
alert(o.1); 

//But this will do the trick
alert(o[1]); 
{% endhighlight %}

##A cloning function
A very basic shallow cloning function could look something like this. Here we're using the ``for in`` syntax to enumerate over the original objects properties, the ``prop`` variable in the example will hold the property name as a string which gives us the ability to create a property with the same name on the clone using index syntax, we use the same syntax to get the value from the original objects property and assign it to the new property on the clone. We use the ``if(original.hasOwnProperty(prop))`` check to make sure that we're not cloning a property from the original objects prototype.

{% highlight javascript %}
var makeClone = function(original){
    var clone = {};
    for(var prop in original){
        if(original.hasOwnProperty(prop)){
            clone[prop] = original[prop];   
        }
    }
    return clone;
}
{% endhighlight %}

###What about deep cloning?
What will happen if we throw an object that has properties containing objects into this function?

{% highlight javascript %}
var original = {
    test: 'test',
    sub: {
        test: 1
    }
};

var clone = makeClone(original);
{% endhighlight %}

This will in fact work in the sense that the clone will look exactly like the original, but the sub property of the clone will be a reference to the sub property of the original. Meaning that you would get this kind of behaviour:

{% highlight javascript %}
original.sub.test = 2

//This will now also return 2 since it's a reference to the original
clone.sub.test
{% endhighlight %}

Which may or may not be what you want.

##Actual deep cloning function
What if we would like to actually deep clone objects? What would that function look like? Well, it could look something like this

{% highlight javascript %}
var makeClone = function(original){
    var clone = {};
    for(var prop in original){
        if(original.hasOwnProperty(prop)){
            if(Object.prototype.toString.call(original[prop]) === '[object Object]')
                clone[prop] = makeClone(original[prop])
            else
                clone[prop] = original[prop];   
        }
    }
    return clone;
}
{% endhighlight %}

The difference between this and our previous function is the type check ``Object.prototype.toString.call(original[prop]) === '[object Object]'`` that makes sure that sub objects are also sent through the cloner and then assigned to the parent clones new property. This will run recursively for any level of child objects.

##What about properties that references arrays?
Our current code will have the same "Problem" as the first version we wrote, a clone will contain a reference to the same array as the original, lets fix that just for the heck of it. Oh, and lets make sure that it deepclones all items in the array, even if they happen to be arrays themselves.

{% highlight javascript %}
var makeClone = function(original){
    var clone = {},
        getValue = function(original){
            var value = original;
            if(Object.prototype.toString.call(original) === '[object Object]')
                value = makeClone(original)
            else if(Object.prototype.toString.call(original) === '[object Array]'){
                value = [];
                for(var i = 0; i < original.length; i++)
                    value[i] = getValue(original[i]);
            }
            return value;
        };
    for(var prop in original){
        if(original.hasOwnProperty(prop)){
               clone[prop] = getValue(original[prop]);
        }
    }
    return clone;
}
{% endhighlight %}

This was a perfect time to refactor the code in the original ``for in`` loop since arrays can also contain primitives, objects and other arrays, just like objects. The only other change is the addition of code that detects if the property value is an array ``Object.prototype.toString.call(original) === '[object Array]'`` and loops over it and insert every value at the same index in a new array, deepcloning if needed.

##What about the prototype?
Right, our clone should probably have the same prototype as the original.
{% highlight javascript %}
var makeClone = function(original){
    var clone = Object.create(Object.getPrototypeOf(original)),
    ...
}
{% endhighlight %}
We replace the line where we set clone to a new object literal with a line that uses ``Object.create``, this function enables us to create new objects with prototypes without having to create an empty constructor function, the prototype for the new object is the first parameter supplied to ``Object.create`` and we get the prototype for the original object by calling ``Object.getPrototypeOf(original)``.

##Functions?
Functions will work if it refers to its parent object using ``this``. It gets a bit harder if it's using a variable name to refer to the parent as this cant really be changed without programmatically reading the function text and using some form of eval evil to rewrite it.

{% highlight javascript %}
var original = {
    name: 'original',
    getName: function(){
    	return this.name;
	},
	getName2: function(){
		return original.name;
	}
};

var clone = makeClone(original);
//change name of clone
clone.name = 'clone';

clone.getName(); //'clone';

clone.getName2(); //'original'
{% endhighlight %}

##Merging objects
We will now rewrite the code to allow us to pass more than one original object into the function. The returned object will then contain properties from all of these objects. This example will work like "last in wins", meaning that if the all objects has the property "name", then the value from the last object will be the one that is assigned to the returned object.

We are going to make use of the ``arguments`` object that are present in javascript functions. This is an array like object that has the length property and its items can be retrieved by integer index. Meaning that we can build a for loop on it.

{% highlight javascript %}
var makeClone = function(original){
    var clone = Object.create(Object.getPrototypeOf(arguments[arguments.length -1])),
        ...; //getValue function is untouched
    for(var i = 0; i < arguments.length; i++){
        for(var prop in arguments[i]){
            if(arguments[i].hasOwnProperty(prop)){
            	clone[prop] = getValue(arguments[i][prop]);
            }
        }
    }
    return clone;
}
{% endhighlight %}

The new code here is that we pick the prototype from the last argument instead of from a named parameter, we also loop over the arguments and assigns each objects properties into the clone, which will overwrite it if it already exists.

##Extending the code even further
You can extend this code even further by adding the ability to do some form of deep merging where properties that are on more than one argument doesn't overwrite the previous one if it's an object, but instead it merges these to.

##Working code
The full working code with some tests can be found in this [fiddler](http://jsfiddle.net/srosengren/a9w3fm13/)