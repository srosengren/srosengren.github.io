---
layout: presentation
title:  "Intro to React"
date:   2015-11-04 19:04:00
tags: []
---

<div style="height: 200px"></div>

#React

##What? Why?
* A viewengine
* Not a framework, coexists with others
* Render on every change
* Templates? We've got javascript
* Components
* Virtual DOM
* Lightweight description, not actual DOM
* Easy isomorphism
* Learn once, use everywhere
* Enables the developer to do the right thing (immutability)
* "Throwaway code" (loosely coupled) = Easy to iterate

React wraps an imperative API with a declarative one.


<div style="height: 200px"></div>

##JSX

* Full power of javascript
* Not html, neither is templates
* Single event handler
* React native

<div class="pure-g">
    <div class="pure-u-1-2">
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
		This is...
    </div>
    <div class="pure-u-1-2">
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
		...transpiled into this.
    </div>
</div>

<div style="height: 100px"></div>

##Components

<div class="pure-g">
	<div class="pure-u-1-3" style="display: flex;align-items: center;">
		<ul>
			<li>Templates separate technologies, not concerns</li>
			<li>Only way in is props, only thing out is a view</li>
		</ul>
	</div>
	<div class="pure-u-2-3">
		<img src="/media/react-flow.jpg" style="width: 100%" />
	</div>
</div>

<div class="pure-g">
	<div class="pure-u-1-2">
<h3>Stateful</h3>
{% highlight js %}
var MyComponent = React.createClass({
  getInitialState: function(){
    return {number: 0};
  },
  increment: function(){
    this.setState({number: this.state.number + 1});
  }
  render: function(){
    return (
      <div>
        <button onClick={this.increment}>
          {this.state.number}
        </button>
      </div>
    )
  }
})

class MyComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {number: 0};
    this.increment.bind(this);
  }
  increment(){
    this.setState({number: this.state.number + 1});
  }
  render(){
    return (
      <div>
        <button onClick={this.increment}>
          {this.state.number}
        </button>
      </div>
    )
  }
}
{% endhighlight %}
	<ul>
		<li>Has a backing instance (this)</li>
		<li>Lifecycle methods</li>
		<li>Access to this.state</li>
	</ul>
	</div>
	<div class="pure-u-1-2">
<h3>Stateless</h3>
{% highlight js %}
var MyComponent = function(props){
  return (
    <div>
      <button onClick={props.increment}>
          {props.number}
      </button>
    </div>
  )
}
{% endhighlight %}

	<ul>
		<li>Pure function (No side effects)</li>
		<li>Gets props as as an argument</li>
		<li>Faster path to render</li>
	</ul>
	</div>
</div>

<div style="height: 100px"></div>

##Render into DOM
<div class="pure-g">
	<div class="pure-u-1-2">
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
		This is...
	</div>
	<div class="pure-u-1-2">
{% highlight html %}
<html>
  <body>
    <div id="MountNode">
      <h1>Hello World!</h1>
    </div>
  </body>
</html>
{% endhighlight %}
		...rendered into this.
	</div>
</div>

Common: 

* Top level component 
* Single entry

Also:
 
* Augment existing app with sprinkles of React.

<div style="height: 100px"></div>

##If statements
<div class="pure-g">
	<div class="pure-u-1-2">
		This would be...
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

...transpiled into this, illegal javascript.

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
	</div>
	<div class="pure-u-1-2">
		Whereas this would be...
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

...transpiled into this, totally legit javascript.

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
	</div>
</div>

<div style="height: 100px"></div>

##Loops/lists

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

<div style="height: 100px"></div>

##Composition

* Common pattern to have a stateful component composed with stateless children (controller view)
* Children has no knowledge of parent
* Communicates "up" with callbacks or actions.

<div style="height: 50px"></div>

### State vs props

* State is a side effect
* Pure functions
* Single source of truth
* Which ancestor has changed?
* Don't convert props to state, changes ownership, becomes stale.

{% highlight js %}

//NO! Bad developer!
var ItsMine = React.createCLass({
  getInitialState: function(){
    return: {
      theOneRing: this.props.theOneRing
    }
  },
  render: function(){
    return <h1>{this.state.theOneRing}</h1>
  }
});

//Better
var MaybeILook = React.createCLass({
  getOwnRing: function(ring){
    this.setState({myRing: ring});
  },
  render: function(){
    return <h1>{this.state.myRing || this.props.theOneRing}</h1>
  }
});

//Often best
var DisplayPrettyRing = function(props){
  return <h1>{props.theOneRing}<h1>
}

{% endhighlight %}

<div style="height: 100px"></div>

###Controller view

{% highlight js %}
var Menu = React.createClass({
  selectItem: function(itemId){
    this.setState({selectedItemId: itemId});
  },
  render: function(){
    return (
      <div>
        <MenuItem select={this.selectItem.bind(null,1)} isSelected={this.state.selectedItemId === 1}>
          Item1
        </MenuItem>
        <MenuItem select={this.selectItem.bind(null,2)} isSelected={this.state.selectedItemId === 2}>
          Item2
        </MenuItem>
        <MenuItem select={this.selectItem.bind(null,3)} isSelected={this.state.selectedItemId === 3}>
          <h4>Complex child</h4>
          <p>Desc</p>
        </MenuItem>
      </div>
    )
  }
})

var MenuItem = function(props){
  return (
    <div onClick={props.onClick>
      {props.children}
    </div>
  )
}
{% endhighlight %}

<div style="height: 100px"></div>

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

<div style="height: 100px"></div>

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

<div style="height: 100px"></div>

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


<div style="height: 200px"></div>

#Flux

##Types of flux

###Flux with dispatcher, Flux utils

{% highlight js %}

var appDispatcher = new Flux.Dispatcher();

class Store extends PseudoStore {
  number: 0,
  unregisterToken: appDispatcher.register(function(action){
    if(action.type === 'ACTION_INCREMENT'){
      this.number++;
    }
    this.emitChange();
  });  
}

var NumberComponent = React.createClass({
  getInitialState: function(){
    return {
      storeData: Store.get();
    }
  },
  componentWillMount: function(){
    this.unregisterStore = Store.register(this.onStoreChange);
  },
  componentWillUnmount: function(){
    this.unRegisterStore();
  },
  onStoreChange: function(){
    this.setState({
      storeData: Store.get();
    });
  },
  render: function(){
    return <div>{this.state.storeDate</div>;
  }
});

{% endhighlight %}

* Very verbose
* Magical strings

###Flux without dispatcher, Reflux

{% highlight js %}

var incrementAction = Reflux.createAction('increment');

var Store = Reflux.createStore({
  number: 0,
  init: function(){
    this.listenTo(incrementAction,this.increment);
  },
  increment: function(){
    this.number++;
    this.trigger(this.number);
  }
});

var NumberComponent = React.createClass({
  getInitialState: function(){
    return {};
  },
  mixins: [Reflux.listenTo(Store,'onStoreChange')],
  onStoreChange: function(storeState){
    this.setState({
      storeData: storeState
    });
  },
  render: function(){
    return <div>{this.state.storeDate</div>;
  }
});

{% endhighlight %}

* Every action is a dispatcher
* Stores can listen to individual actions


###Flux without flux, Redux

##Immutable data

* Easy to see if an object has changed
* oldObject === newObject instead of oldObject.prop1 === newObject.prop1 || oldObject.prop2 === ...
* Removes one source of side effects.
* Object.freeze, extreme immutability