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

###Mixins

{% highlight js %}
var StoreMixin = {
  componentWillMount: function() {
    this.unsubscribe = this.store.subscribe(this.storeChanged);
  },
  componentWillUnmount: function() {
    this.unsubscribe();
  }
};

var StoreListener = React.createClass({
  mixins: [StoreMixin],
  store: MyStore,
  storeChanged: function(){
    this.setState({data: MyStore.get()});
  },
  render: function(){
    return <div>{this.state.data}</div>
  }
});

{% endhighlight %}

* Provides lifecycle hooks
* Magic merge of lifecycle hooks
* Might use the same state field
* Crashes if mixins define the same props/functions
* Not available on es6 classes

###Higher order components

{% highlight js %}

var StoreHO = (Component,store,mapping) => {
  return React.createClass({
    componentWillMount: function() {
      this.unsubscribe = store.subscribe(this.storeUpdate);
    },
    componentWillUnmount: function() {
      this.unsubscribe();
    },
    storeUpdate: function(){
      this.setState(mapping(store.get()));
    },
    render: function(){
      return <Component {...this.props} {...this.state} />
    }
  })
}

var StoreListener = function(props){
  return <div>{props.data}</div>
}

StoreListener = StoreHO(StoreListener,MyStore,function(storeData){
  return {
    data: storeData
  }
});

{% endhighlight %}

* Has its own backing instance (this) with own state
* Infinitely chainable/nestable
* Only collision risk is props being overwritten
* Can wrap stateless components
* Transparent

###Wrapper components

{% highlight js %}

var StoreWrapper = React.createClass({
  componentWillMount: function() {
    this.unsubscribe = this.props.store.subscribe(this.storeUpdate);
  },
  componentWillUnmount: function() {
    this.unsubscribe();
  },
  storeUpdate: function(){
    this.setState(mapping(this.props.store.get()));
  },
  render: function(){
    return React.Children.map(this.props.children, function(child) {
      return React.cloneElement(child, this.state);
    });
  }
});

var StoreConsumer = function(props){
  return <div>{props.data}</div>
}

var Application = React.createClass({
  render: function(){
    return (
      <StoreWrapper store={MyStore}>
        <StoreConsumer />
      </StoreWrapper>
    )
  }
});

{% endhighlight %}

* Mostly used to provide layout wrapping
* Easy to provide separate props for wrapper/child
* Can wrap stateless components
* Hidden coupling
* Has to provide layout
* Opaque

#Flux

##Types of flux

###Flux with dispatcher

Flux toolkit

###Flux without dispatcher

Reflux

###Flux without flux

Redux