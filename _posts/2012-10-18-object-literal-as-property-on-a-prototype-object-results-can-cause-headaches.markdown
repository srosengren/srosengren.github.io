---
layout: post
title:  "Object literal as property on a prototype object results can cause headaches"
date:   2012-10-18 13:36:00
tags: [web,javascript,jquery,development]
---

Part of today was to enable an object literal to be used as a prototype. This object in turn had an object literal of its own (along with a few methods).

Here is pseudo-code to display what happened:

The object to be used as a prototype 

{% highlight  javascript %}
baseObject = {
	settings: {
		aSetting: 'value',
		otherSetting: 'value'
	},
	aProperty: [],
	init: function (settingsObject) {
		var that = this
		that.settings.aSettings = settingsObject.a;
		that.settings.otherSettings = settingsObject.o;
	}
} 
{% endhighlight %}

This object is then used as a prototype for a new object using a create method. 

{% highlight  javascript %}
if (Object.create !== 'function') {
	Object.create = function (proto) {
		var obj = function () { };
		obj.prototype = proto;
		return new obj();
	}
}

var newObject = Object.create(baseObject);
newObject.init({
	a: 'newValue',
	o: 'newValue'
}); 
{% endhighlight %}

Unfortunately, this doesn't do what I wanted it to do. What I wanted is of course for the settings object of the newObject object to contain the properties that I put in the settingsObject parameter to the init function. What really happens is that I overwrite the properties of the Prototypes settings object. This means that when I create a second object with the baseObject as a prototype, I actually overwrite the prototypes properties again which of course reflects on my first object, not good.


Here is a working solution to this problem, I simply replace the whole settings object for my new objects. 

{% highlight  javascript %}
baseObject = {
	settings: {
		aSetting: 'value',
		otherSetting: 'value',
	},
	aProperty: [],
	init: function (settingsObject) {
		var that = this;
		that.settings = {
			aSettings: settingsObject.a,
			otherSettings: settingsObject.o
		}
	}
} 
{% endhighlight %}

By doing this I instead replace the settings object alltogether which places the new settings object on my object instance instead of on my prototype.

This is of course pseudo-code and there are prettier ways to replace the settings object with the new properties but this solution shows the problem.