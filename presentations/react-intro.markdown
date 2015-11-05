---
layout: default
title:  "Intro to React"
date:   2015-11-04 19:04:00
tags: []
---

##wat?
A viewengine
Virtual DOM
Render on every change

##Components

###Stateful
{% highlight js %}
var MyComponent = React.createClass({
  render: function(){
    return <div></div>
  }
})

class MyComponent extends React.Component {
  render(){
    return <div></div>;
  }
}
{% endhighlight %}

* Has a backing instance (this)
* Lifecycle methods
* Access to this.state

###Stateless
{% highlight js %}
var MyComponent = function(props){
  return <div></div>;
}
{% endhighlight %}

* Pure function (No side effects)
* Gets props as as an argument
* Faster path to render

###Composition

* Common pattern to have a stateful component composed with stateless children (controller view)
* Children has no knowledge of parent
* Communicates "up" with callbacks or actions.

{% highlight js %}
var Menu = React.createClass({
  selectItem: function(itemId){
    this.setState({selectedItemId: itemId});
  },
  render: function(){
    return (
      <ul>
        <MenuItem select={this.selectItem.bind(null,1)} isSelected={this.state.selectedItemId === 1}>
          Item1
        </MenuItem>
        <MenuItem select={this.selectItem.bind(null,2)} isSelected={this.state.selectedItemId === 2}>
          Item2
        </MenuItem>
        <MenuItem select={this.selectItem.bind(null,3)} isSelected={this.state.selectedItemId === 3}>
          Item3
        </MenuItem>
      </ul>
    )
  }
})

var MenuItem = function(props){
  return (
    <li onClick={props.onClick>
      {props.children}
    </li>
  )
}
{% endhighlight %}

##JSX
{% highlight js %}
var ProfileImage = function(props){
  return <img src={props.url} />
}

var Bio = function(props){
  return (
    <div>
      <h2>{props.title}</h2>
      <ProfileImage url="urlToImage" />
    </div>
  )
}
{% endhighlight %}

Is transpiled into

{% highlight js %}
var ProfileImage = function(props){
  return React.createElement('img',{src: props.url})
}

var Bio = function(props){
  return React.createElement(
    'div',
    null,
    React.createElement(
      'h2',
      null,
      props.title
    ),
    React.createElement(
      ProfileImage,
      {url: "urlToImage"}
    )
  )
}
{% endhighlight %}

##Render into DOM

{% highlight html %}
<html>
  <body>
    <div id="MountNode"></div>
  </body>
</html>
{% endhighlight %}

{% highlight js %}
var MainComponent = React.createClass({
  render: function(){
    return <h1>Hello world!</h1>
  }
});

ReactDOM.render(
  React.createElement(MainComponent),
  document.getElementById('MountNode')  
)
{% endhighlight %}

{% highlight html %}
<html>
  <body>
    <div id="MountNode">
      <h1>Hello World!</h1>
    </div>
  </body>
</html>
{% endhighlight %}

Common: Top level component, single entry
Also: augment existing app with sprinkles of React.

###If statements

{% highlight js %}
var ProfileImage = function(props){
  return (
    <div>
      if(props.isIcon)
        <i className="icon"></i>
      else
        <img src={props.url} />
    </div>
  )
}
{% endhighlight %}

Not legal javascript

{% highlight js %}
var ProfileImage = function(props){
  return React.createElement(
    'div',
    null,
    if(props.isIcon)
      React.createElement(
        'i',
        {className: 'icon'}
      )
    else
      React.createElement(
        'img',
        {url: props.url}
      )
  )
}
{% endhighlight %}

{% highlight js %}
var ProfileImage = function(props){
  return (
    <div>
      { props.isIcon ?
        <i className="icon"></i>
      :
        <img src={props.url} />
      }
    </div>
  )
}
{% endhighlight %}

Totally legit

{% highlight js %}
var ProfileImage = function(props){
  return React.createElement(
    'div',
    null,
    (props.isIcon ?
      React.createElement(
        'i',
        {className: 'icon'}
      )
      :
      React.createElement(
        'img',
        {url: props.url}
      ))
  )
}
{% endhighlight %}

###Loops/lists

Same as if statments, can't have a for loop in function call

{% highlight js %}
var Menu = function(props){
  return (
    <ul>
      props.menuItems.map(function(item){
        <MenuItem item={item} />
      })
    </ul>
  )
}
{% endhighlight %}

##Composition

###Mixins

###Higher order components

###Wrapper components

#Flux

##Types of flux

###Flux with dispatcher

Flux toolkit

###Flux without dispatcher

Reflux

###Flux without flux

Redux