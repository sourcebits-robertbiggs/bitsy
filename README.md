#Bitsy

##A Tiny Mobile Web App Framework

Bitsy was created for making mobile Web apps. It's small, just 12kb minified. Although small, it packs a lot of features:

1. [DOM Ready](#user-content-dom-ready)
2. [Query Selectors](#user-content-selectors)
3. [Object Extension](#user-content-object-extension)
4. [Events](#user-content-events) - Bound and Delegated
5. [Pub/Sub](#user-content-pub-sub) - Evented Observers for UI interaction
6. [Data Binding](#user-content-data-binding) - One-Way, Two-Way with Mediators
7. [Dependency Injection](#user-content-dependency-injection)
8. [Templates](#user-content-templates)
9. [ECMAScript6 Promises](#user-content-promises)
10. [Ajax](#user-content-ajax) - Uses ECMAScript 6 Promies
11. [Get and Set Styles](#user-content-styles)
12. [Prepend, Append, Before and After](#user-content-modifiers)

##Building


If you want to build Bitsy form source file, you'll need to have Node and Gulp installed. To install Node, go to there website and follow the instructions. Once that is done, open your terminal and run:

On Mac:

```
sudo npm install gulp-cli
```

On Windows:

```
npm install gulp-cli
```

Then cd to the Bitsy folder and run:

```
gulp
```

<a name="dom-ready"></a>
##1. DOM Ready

Bitsy has a DOM Ready function just like jQuery. You can use this to delay the execution of your code until the DOM is fully loaded. This is necessary when you code needs to access DOM nodes. 

```
$(function() {
  // You code goes here.
});
```


If you have chunks of code that do not need to access the DOM, you can instead put them in an IIFE (Immediately Invoked Function Expression):

```
(function() {
  
})();
```

<a name="selectors"></a>
##2. Query Selectors

###$: Single Selector

Bitsy has two types of query selectors: $ and $$. Use $ when you want to get a single node. This method will always return the first match for the selector you provided:

```
var li = $('li');
// Returns the first list item

var div = $('div');
// Returns the first div in the document

var result = $('#result');
// Returns the element with id of 'result'

var button = $('.button');
// Returns the first element found with class of 'button'
```

After retrieving an element with $, you can operate on it with normal JavaScript methods:

```
var title = $('h1');
// Set a title attribute:
title.setAttribute('title', 'A very special title');
// Set an id:
title.id = 'myTitle';
```

###$$: Multiple Selector

If you want to get multiple DOM nodes, use the $$ method. This will always return an array. This method will always return an array, even when it finds nothing. To make sure you got something back you can check the returned array's length property.

```
var li = $$('li');
// If the list had 6 list items,
// li.length would be 6.
// If there were no list items,
// li.length would be 0.
```

Because $$ always returns an array, we can access the nodes using any of the array methods, such as `forEach`, `filter`, `map`, etc.

```
$$('li').forEach(function(item) {
  $.setStyle(ctx, {color: 'blue'});
});
```
```
// Get an array of all list items with the class "new":
var newItems = $$('li').filter(fuction(item) {
  return item.classList.contains('new');
});
```

As you may have noticed, you can use the ECMAScript 5 methods for class names:

```
element.classList.contains();
element.classList.add();
element.classList.remove();
element.classList.toggle();
```

Similarly, you can access all attributes like so:

```
element.hasAttribute();
element.getAttribute();
element.setAttribute();
```

You can also access siblings and child nodes as follows:

```
element.nextElementSibling
element.previousElementSibling
element.children
element.firstElementChild
element.lastElementChild
element.parentElement
```


<a name="object-extension"></a>
##3. Object Extension

Bitsy allows you to extend any object. You can extend your own custom objects, or even native JavaScript objects using `$.extend`. By default, all properties added to an object are not ennumerable. This is convenient if you do extend native JavaScript objects because those properties won't be exposes by loops. 

To extend an object, just pass it as the first argument, followed by an object literal of the keys and values you want to add:

```
var myObj = { name: "Wobba"};
$.extend(myObj, {
  age: 100,
  job: "prinicipal wobbulator"
});
/*
myObj is now:
{
  age: 100,
  job: "principal wobbulator",
  name: "Wobba"
}
*/
```

If you only provide an object literal of key/values, `$.extend` will extend the `$` method:

```
$.extend({
  makeAnnouncement: function(msg) {
    alert(msg);
  }
});
$.makeAnnouncement('This is an announcement');
// Will alert the message
```

##4. Events

Bitsy provides events. These are:

- on
- off
- trigger

###on

Both `on` and `off` can be used for handling an event on a single element, or delegated events for multipe elements. To bind an event to a single element, do the following:

```
$.on('#anElement', 'click', function(e) {
  e.preventDefault();
  alert(this.innerText);
});
```

###Delegated Events

To register a delegated event you just need to decide which ancestor element to use as the base for the elements you wish to monitor. In this example we'll use an unordered list to track user interaction with the list items:

```
var ul = $('ul');
$.on(ul, 'li', 'click', function(e) {
  // alert the text of the list item
  // upon which the user clicked:
  alert(this.innerText);
});
```

###Multiple Events

You can also register multiple events at the same time, such as to capture mouse events and touch events. Just pass a quoted string with spaces separating the events:

```
var button = $('button');
$.on(button, 'click touchstart', function(e) {
  // Will work with a click or touch:
  alert("You've interactied with this button!");
});
```

###off

You can remove an event if you need to. If is very important to remove any events that you have registered before deleting the elements that events are on, otherwise you'll wind up with bad memory leaks. To unbind a single event, just pass in the element, the event and, if you have it, the name of the function, otherewise just the element and event with be sufficient. 

```
// Remove click event from button:
$.off($('button'), 'click');

// Remove delegated event:
$.off($('ul'), 'li', 'click');
```

###trigger

Sometimes you may need to trigger an event on a element in order to execute an event registered on it. You can do that as follows:

```
var button = $('button');
$.on(button, 'click', function() {
  alert('You just clicked me!');
});

// Trigger a click on the button:
$.trigger(button, 'click');
// Alerts: "You just clicked on me!"
```

When triggering and event, you can also pass data which can then be accessed by the callback handling the event. Whatever data you pass with the event will be exposed on the event through the data property:

```
var button = $('button');
$.on(button, 'click', function(e) {
  // The passed data is exposed by the event's "data" property:
  alert(e.data);
});

// Trigger event and pass data for the above callback:
$.trigger(button, 'click', 'This is me!');
// The button callback will alert: "This is me!"
```


<a name="pub-sub"></a>
##5. Pub/Sub - Evented Observers for UI interaction

Bitsy enables you to create simple Observer patterns using its pub/sub methods

- subscribe
- publish
- unsubscribe

These methods allow you to subscribe to and publish events and pass data from one part of your appplication to another. This becomes really useful where you want to decouple your code, such as interface interactions and the code that will manipulate the application's data. This broadcast system is very versatile. You can name a broadcast with simple and concise terms, or you can create namespaced channels that clearly define what each broadcast does as well as their relationship to each other. 

The beauty of this is that the code that publishes does not need to know anything about the code that subscribed, and the code that subscribes does not need to know anything about the code that publishes. The communication is all done by the broadcast. One block of code publishes, and another reactions when the publication occurs. Many different blocks could send the same broadcast with different data at different times. Or only one block of code might send a broadcast, and many blocks of could could subscribe and reaction when that occurs.

###Subscribing and Publishing

Subscribing to a broadcast is easy:

```
// The first argument in the callback will be the event,
// the second will be any data that was passed:
$.subscribe('pizza-is-ready', function(e, data) {
  alert('You ordered: ' + data.name +'. It will arrive in ' + data.time + ' minutes.')
});
```

Similarly, you can send a publication like this:

```
// Publish a broadcast
$.publish('pizza-is-ready', {name: 'Mushroom and Sausage', time: 30});
```
As soon as you publish this broadcast, the previous subscriber will capture the broadcast and alert the received data.

###Unsubscribe

If you want to, you can stop code from receiving a broadcast at any time by unsubscribing from it. To do this, you need to have a named subscription:

```
// Subscribe to "pizza-is-ready" using the token "pizzaOrder":
var pizzaOrder = $.subscribe('pizza-is-ready', function(e, data) {
  alert('You ordered: ' + data.name +'. It will arrive in ' + data.time + ' minutes.')
});

// Publish a broadcast for pizza:
$.publish('pizza-is-ready', {name: 'Mushroom and Sausage', time: 30});

// Unsubscribe from pizza broadcast.
// Use the token from the subscription:
$.unsubscribe(pizzaOrder);

// Publish another broadcast for pizza.
// This time, nothing will happen because there is no subscriber:
$.publish('pizza-is-ready', {name: 'Peperoni', time: 10});
```

###Namespaced Broadcasts

The toke for any particular broadcast is just a string. This means you can create namespaced broadcasts to better define what these do for your application:

```
var currentComedy = $.subscribe('movies/current/comedy', function(e, data) {
  // Do something with data:
});
var upcomingHorror = $.subscribe('movies/upcoming/horror', function(e, data) {
  // Do something with data:
});
var documentaries = $.subscribe('movies/free/documentaries', function(e, data) {
  // Do something with data:
})
var freeSports = $.subscribe('movies/free/sports', function(e, data) {
  // Do something with data:
});
var paidSports = $.subscribe('movies/paid/sports', function(e, data) {
  // Do something with data:
});
```

###Mediators

Where the publication system really shines is in enabling you to create mediators. A mediator is an object or block of code that stands between several parts of an application. It's purpose is to keep the parts separate, even though they need to interact in a coordinated manner. A mediator allows us to keep the parts of the application agnostic while the mediator manages the disparate parts.

A mediator is an object that can contain business logic and workflow instructions. It decides when to call an object's methods or when to update that object's properties. Without the mediator, these decisions would need to be made by the subscriber and/or publisher. Hence the mediator provides a convenient, centralized way to abstract the business logic of an object, such as the model or user interface. In contrast, a publisher sends out its broadcast and doesn't care what happens after that. Similarly, a subscriber merely waits until a broadcast occurs before it responds. It doesn't know how many publishers there are, or if there are other subscribers. A mediator can know and interact with many subscribers or publishers. Also the mediator allows you to move decion making out of the subscribers and publishers and into a central point of control. 

With Bitsy, you can use publishers and subscribers to implement your mediators and this is a natural fit. For Web apps, mediators are a perfect solution to managing user interactions with the interface and data. 

Here's some markup. We want to link up the label with the input so that as the user types in the input, the label gets updated automatically:

```
<input id='myMessage' type="text">
<label for="myMessage" id='forMyMessage'></label>
```

Without a mediator, if we want the label to update when the user types, we would have to do that inside an event handler:

```
var input = $('#myMessage');
var label = $('#forMyMessage');

// Register an event on the input.
// This will update the value of the  
// label with its value as the user types:
$.on(input, 'input', function(e) {
  // Update the label text with the input value:
  label.innerText = this.value;
});
```

So, if that's all you're doing in your app, its not a big deal. However, if you have a lot of user interactions, you'll quickly discover that this type of tight coupling between one element and another is hard to maintain. Unfortunately this is the typical development pattern that developers use when they work with jQuery. We can get away from this tight coupling and make our code easiy to understand and maintain my using a mediator. Using a publication, we can create a mediator to update the label. Notice the difference in the code that follows:


```
var input = $('#myMessage');
var label = $('#forMyMessage');

// Register an event on the input.
// This will publish a broadcast with 
// the value of the input as the user types:
$.on(input, 'input', function(e) {
  $.publish('my-message', this.value);
});

// Define a mediator.
// This will subscribe to the broadcast published
// by the input and update the label:
var LabelMediator = $.subscribe('my-message', function(event, message) {
  label.innerText = message;
});
```

Although this is a very trivial example, it shows the role a mediator plays in negotiating changes in the interface. The input knows nothing about the label. It merely broadcasts a publication with every keystroke the user makes. It doesn't care what happens with the broadcast, maybe nothing will happen, and that's alright. The label has zero code. The mediator is subscribed to the same broadcast that the input publishes. When a broadcast occurs, the mediator updates the label. If the event that publishes the broadcast was removed, or the input itself was removed, the mediator would simply remain inactive. 

In this example, the broadcast carried a plain string as its data and the mediator output the string as the content of the label. You can pass whatever data you need in a broadcast and your mediators can then access it. As a matter of fact, different publishers can send different types of data -- strings, array or objects -- using the same broadcast channel. Your mediators could then check for the type of data and react differently depending on the type of data received.

By decoupling your interface with mediators, you can make it easy for non-programmers to style and even modify the layout of your app without breaking it. As long as the selectors for the publishers and subjects of the mediators are the same, they will work. 

The mediator example resulted in the value of the label being bound to the value of the text input. A mediator could also update a model, store its value locallly, perform an Ajax request or post the data to a remote server. 


<a name="data-binding"></a>
##6. Data Binding - One-Way, with Mediators - Two-Way 

In the previous exmaple of a mediator we saw how we were able to bind the value of a label to the value of a text input. Bitsy provides a way to do this automatically. You can bind the value of one element to another using a pair of declarative attributes. These are:


- data-controller
- data-model

The data-controller will be the element that publishes a broadcast, and the data-model will be the elment that listens for and reacts to that broadcast. For this to work, a data-controller and a data-model need to have the same value. Let's look at our text input and label example again:

```
<input id='myMessage' name='myMessage' data-controller='my-message' type="text">
<label for="myMessage" data-model='my-message'></label>
```
As you can see, the text input has a data-controller with the value of 'my-message' and the label has a data-model with the value of 'my-message'. That's all you have to do to bind the label to the input. To make this happen, at load time we execute the following method:

```
$(function() {
  $.bindData();
})
```

This will scan the document for matching data-controllers and data-models and create mediators and broadcasts to connect them. Based on the value of the data-controller, Bitsy creates a broadcast using that value and prefixes it with `data-binding-`. So, in our example the broadcast would be `data-binding-my-message`. You could have more than one data-controller with the same value so that any one of them can broadcast and update the data-model. Or you could have any number of data-models with the same value as a single data-controller so that all of them are updated simultaneously. So, you can create the following relationships between data-controllers and data-models:

- one to one
- many to one
- one to many
- many to many

###Two-way Data Binding

Using this method of data bind is a simple way to establish one-way data binding in your app. But sometimes you may need to have two-way data-binding. You can do this as well by writing a mediator. In the current state of our example there is no need for two-way data binding. To change this, we are going to create a data model that the input will update. We're going to create a private property to hold the data `private_data` and we'll create a subscribe that will listen :

```
var InputTextModel = function() {
  // Define a private property to hold the data:
  var private_data = '';

  // Subscribe to a broadcast, and when this occurs,
  // update the value of the private data:
  $.subscribe('data-binding-my-message', function(event, data) {
    private_data = data;
  });
};
``` 

Because the model is subscribed to the same broadcast published by the text input, its private value will update automatically as the user types. At the moment, there is no way for us to verify this because the data is private. We can define a getter so that we can text the model's value in the browser's console:

```
var InputTextModel = function() {
  // Define a private property to hold the data:
  var private_data = '';

  // Subscribe to a broadcast, and when this occurs,
  // update the value of the private data:
  $.subscribe('data-binding-my-message', function(event, data) {
    private_data = data;
  });

  // Define a getter:
  this.get = function() {
    return private_data;
  }
};
```

Now we can create an instance of our model and then check its value in the browser console:

```
var myModel = new InputTextModel();
myModel.get()
// At the moment it returns ""
```

Now, if you start to type in the text input and then use the getter to test the value of myModel, you should see that it returns the same value as that of the input. OK. That's nice, but this is still just a more complex example of one-way data binding. Now we have a label and a data model bound to the value of the input. What we want to do next is bind the value of the data model back to the input so that if we update the data model from somewhere else, the input's value will update. In this example we're going to update the data model using a setter and then updating it in the browser condole. In real life you would do this in some other part of your app when something else occurred. Here's our setter:

```
var InputTextModel = function() {
  // Define a private property to hold the data:
  var private_data = '';

  // Subscribe to a broadcast, and when this occurs,
  // update the value of the private data:
  $.subscribe('data-binding-my-message', function(event, data) {
    private_data = data;
  });

  // Define a getter:
  this.get = function() {
    return private_data;
  }

  // Define a setter:
  this.set = function(data) {
    // Broadcast "data-binding- my-message".
    // This will update the label:
    $.publish('data-binding-my-message', data);

    // Define a new broadcast.
    // This will be used by a mediator
    // for the text input's value:
    $.publish('update-text-input-value', data);
  };
};
```
###Add a Mediator
Look at the setter. It accepts some data as its argument. It publishes that data in the broadcast `data-binding- my-message`. Since the label is already subscribed to that broadcast by our automatic data binding, its value will update when we use this setter to update the value of the data model. We also defined a second broadcast `update-text-input-value`. We'll use this to update the text input's value when we set the value of the data model. For that to happen we will need to define a mediator for the text input:

```
// Define mediator to update text input
// when the data model is changed by
// its internal set function.
//=====================================
var InputTextMediator = $.subscribe('update-text-input-value', function(event, data) {
  $('#myMessage').value = data;
});
```

With this mediator defined, we can now change the value of the data model by typing into the text input, or change the value of the text input by updating our data model `myModel` using its setter. Using the automatic data binding, and some getter and setters with a mediator, we have create a two-way binding between the value of the text input and the model. This was a very simple example. In most cases one-way data binding will be sufficient for you app's needs. Other large frameworks offer two-way data binding out of the box with minimal code. The handle all the "magic" behind closed doors. This makes it hard to troubleshoot when something goes wrong. Bitsy takes the approach of exposing as much as possible so that you always know what is happening and know where to look when something goes wrong. Writting a model setter and a mediator is a no-brainer. 


<a name="dependency-injection"></a>
##7. Dependency Injection

Nowadays there are a number of large frameworks that offer dependency injection and stress this as one of their strengths. Bitsy also has support for dependency injection and an IOC container, if that is something you need. Here a short explanation about what dependency injection is about. Suppose you are writing an app. You want to include some external code, perhaps this is a standalone module. Rather than using the external code directly in your app, you can use a reference to it. Dependency injection provides a way to get a reference to external code so you can use it inside your own code. This is another convenient way of decoupling your code. When you inject external code into an app, the reference could be switched for a completely different block of code. At first this might not seem very useful, however, if you want to be able to stub functionality in the early stages of development or you want to be able to switch out an external resource for a mock version for unit testing, dependency inject solves these two problems.

The main trick to pulling off dependency injection is creating a way to map a string token to the dependency. The string token will be used in the app to infoke the dependency. Bitsy provides dependency injection through instances of the `Injector` constructor:

```
// Create an instance of the IOC container:
var app = new Injector();
```

Once we have an instance of the Injector, we can run it:

```
app.run(function() {
    console.log('The IOC container is running!')
});
```

In order to inject dependencies, we first have to map them to the terms we want to use:

```
// Define some functions that we want to inject:
//==============================================
// Function that will be injected:
var FirstMsg = {
  announce: function() {
    return 'First message';
  }
};

// Function that will be injected:
var SecondMsg = {
  announce: function(msg) {
    return msg;
  }
};

// Map the above two functions to 
// terms you will use in your app.
// The first argument is the mapped term,
// the second is the dependency's name:
app.map('FirstMessage', FirstMsg);
app.map('SecondMessage', SecondMsg);
```

With the above mapping completed, we can now inject them into our app. To do that we use the `injectInto` method. This takes a function as its argument, along with the injectables as its arguments:

```
// Define some functions that we want to inject:
//==============================================
// Function that will be injected:
var FirstMsg = {
  announce: function() {
    return 'First message';
  }
};

// Function that will be injected:
var SecondMsg = {
  announce: function(msg) {
    return msg;
  }
};

// Create an instance of the IOC container:
var app = new Injector();

// Map dependencies:
app.map('FirstMessage', FirstMsg);
app.map('SecondMessage', SecondMsg);

// Run the instance:
app.run(function() {
  // Inject the dependencies (FirstMessage, SecondMessage):
  //=======================================================
  app.injectInto(function(FirstMessage, SecondMessage) {
    // Use the injected code here:
    console.log(FirstMessage.announce());
    // Returns: "First Message"
    console.log(SecondMessage.announce("This is my message!"));
    // Returns: "This is my message!"
  });
});
```

Notice that our mapped values work just like their original functions. We could also add in some mediators to control our app, along with broadcasts and data binding for some complex application behavior.

###Minification Alert!

Because of the way mapping of dependencies works, if you are going to minify your code, you need to not minify variables, otherwise the dependency injection will break. This is because the minification changes variable from something like `myDependency` into `aB`. Since the mapping uses a string to map to the variables, this type of aggressive variable reduction breaks the ability to identify the dependencies. To use minification with dependency injection use a version that does not minify variables. Consult the documentation for the minifier you use to learn how to do this.

<a name="templates"></a>
##8. Templates

Bitsy has a simple solution for creating HTML templates. Templates can be either strings or script tags. Script tags offer the advantage of not requiring quotes or back slashes for new lines. But script tags need to reside within the document structure, where as string templates are defined inside a block of code. The end result is the same, so it's ultimately up to your preference. 

Here's an example of a template as a script tag and as a string:

```
<script id='myTemplate' type='text/bitsy-template'>
  [[ var len = data.length; ]]
  [[ for (var i = 0; i < len; i++) { ]]
    <li>[[= i+1 ]]: [[= data[i].name ]]</li>
  [[ } ]]
</script>
```

```
var myTemplate = "[[ var len = data.length; ]]\
  [[ for (var i = 0; i < len; i++) { ]]\
    <li>[[= i+1 ]]: [[= data[i].name ]]</li>\
  [[ } ]]";
```

Creating and rendering a template is a three stage process. First you write the template. Then you must parse it. This converts the template into a function. And finally you execute the parsed template function by passing it data and output the result to the page.

Bitsy templates have two types of tags:

- [[ ]]
- [[= ]]

The first set of tags are used to container JavaScript code. This allows you to JavaScript in your template to perform boolean operations, format data, etc. The second set of tags is used to output data. In the previous template examples you can see that the double brackets isolate chuncks of JavaScript code:
```
[[ var len = data.length; ]]
[[ for (var i = 0; i < len; i++) { ]]
[[ } ]]
```

And the double brackets with the equal sign are rendering a data value:

```
<li>[[= data.firstName ]] [[= data.lastName ]]</li>
```
This template would could render an object like this:

```
{
  firstName: 'Wobba',
  lastName: 'Bits'
}
```

If you define a template in a script tag, you need to extract it like so:

```
<script id='myTemplate' type='text/bitsy-template'>
  [[ var len = data.length; ]]
  [[ for (var i = 0; i < len; i++) { ]]
    [[/* Output the index value and name: */]]
    <li>[[= i+1 ]]: [[= data[i].name ]]</li>
  [[ } ]]
</script>
```

```
// Get the contents of the script tag template:
var myTemplate = $('#myTemplate').innerHTML;
```

Once we have the content of a script tag template or a string template, we need to parse it. This is done by passing the template to the `$.template` function:

```
// myTemplate is the content of a script tag template,
// or of a string template:
var parsedTempl = $.template(myTemplate)
```

To get the pased value of the template, we need to run the above parsed version with the data that we want the template to use. Let's assume the template will use the following data:

```
var people = [
  {name: "Joe", age: 21}
  {name: "Tom", age: 28}
  {name: "Bob", age: 24}
];
```
We can now feed this to our template. The parsed template will return the desired markup as its result, so we can just apply it directly to the DOM where we want it.

```
$('#list').innerHTML = parsedTempl(people);
// Populates the list as follows:
<ul id='list'>
  <li>1: Joe</li>
  <li>2: Tom</li>
  <li>3: Bob</li>
</ul>
```

Another way to achieve the same result is to remove the loop from the template and instead do it in JavaScript. Here's how:

```
// Define a template:
var myTemplate = "<li>[[= data.name ]]</li>";

// Parse the template:
var parsedTmpl = $.template(myTemplate);

// Get a reference to our empty list:
var list = $('#list');

// Loop over the array and pass each context
// to our parsed template. Then attach the
// result to the list:
people.forEach(function(ctx) {
  list.innerHTML += parsedTmpl(ctx);
});
```

<a name="promises"></a>
##9. ECMAScript 6 Promises

Bitsy includes support for ECMAScript 6 Promises. Since only the latest browsers support Promises, Bitsy provides a polyfill that implements the same functionality for older browsers. This means you can begin using ECMAScript Promises now.

OK, so what's the big deal with ECMAScript Promises? Hasn't jQuery had deferred objects and promises since, like, for ever? Well, yes, but jQuery's implementation of promises don't keep their promises, unfortunately. And, more importantly, ECMAScript Promises are in the browser and being supported by all major browser vendors. In a few years they will be everywhere. Also, their syntax is different from most other library-based implementations of deferreds or promises, but that's in a good way. Let's take a look:

To create a promise you just use the Promise constructor. This expects a function that it will operate on. Notice that you can manage how to resolve and reject the promise:

```
var myPromise = new Promise(function(resolve, reject) {
  // Do stuff here, 
  // then return successfull boolean:
  if (successfull) {
    // Resolve the Promise:
    resolve('This worked!')
  } else {
    // Reject the Promise:
    reject(Error('There was a problem'));
  }
});
```

With a promise created, you can invoke its `then` method. This works quite differently from a jQuery deferred because `then` is chainable. Furthermore, the `then` of an ECMAScript Promise returns another Promise. jQuery does not. Another difference is how Promises handle errors. With ECMAScript Promises you can catch the error in a `then` function in the second callback, or at any time using the `catch` method.

```
myPromise.then(function(result) {
  // Handle the success:
  console.log(result);
}, function(err) {
  // Handle the error:
  console.log(err);
});
```
Or:

```
myPromise.then(function(result) {
  // Handle the success:
  console.log(result);
})
.catch(function(err) {
  // Handle the error:
  console.log(err);
});
```

Chain `then` methods:


```
myPromise.then(function(result) {
  // Handle the success:
  console.log(result);
})
.then(function() {
  // Do something here:
  console.log('Second Then');
})
.then(function() {
  // Do some more stuff here:
  console.log('Third Then');
})
.catch(function(err) {
  // Handle the error:
  console.log(err);
});
```

By chaining `then` methods, ECMAScript Promises allow you to create synchronous execution of code in JavaScript, avoiding the dreaded pyramid of doom nested callback pattern that often plagues JavaScript code. ECMAScript Promises enable you to write code that is easier to understand and maintain.

If you need to process multiple things and then do something when all of them are done, you can create a promise for each task, then pass them as an array to `Promise.all`:

```
var promise1 = new Promise(function(resolve, reject) {
  // Do stuff;
});
var promise2 = new Promise(function(resolve, reject) {
  // Do stuff;
});
var promise3 = new Promise(function(resolve, reject) {
  // Do stuff;
});

var myPromises = [promise1, promise2, promise3];

// Handle the promises when they are all done:
Promise.all(myPromises)
.then(function(myPromises){
  // Do what you need to do here.
});
```

Also, say you need to try to execute a number of tasks which might take different times. In this case you don't care if they all finish or not. You're only interested in handling the first one to finish. For this situation you can use the `Promise.race` method:

```
var promise1 = new Promise(function(resolve, reject) {
  // Do stuff;
});
var promise2 = new Promise(function(resolve, reject) {
  // Do stuff;
});
var promise3 = new Promise(function(resolve, reject) {
  // Do stuff;
});

var myPromises = [promise1, promise2, promise3];

// Handle the promises when they are all done:
Promise.race(myPromises)
.then(function(myPromises){
  // Do what you need to do when whichever
  // promise finishes first.
});
```

<a name="ajax"></a>
##10. Ajax

Bitsy supports Ajax requests. An Ajax request always returns a promise. If the browser supports the ECMAScript6 Promise, it uses that, otherwise it uses a polyfill. Bitsy's Ajax module support a main `$.ajax()` method, as well as shortcuts for common operations:

- get
- getJSON
- JSONP
- post

The `$.ajax` method can has the following options as arguments:


```
var options = {
  url : 'the/path/here',
  type : /*'GET', 'POST', PUT, 'DELETE'*/,
  data : myData,
  async : 'synch' || 'asynch',
  user : username (string),
  password : password (string),
  dataType : ('html', 'json', 'text', 'script', 'xml', 'form'),
  headers : {},
  success : callbackForSuccess,
  error : callbackForError,
  context: null
}
```
The `$.ajax` method always returns an ECMAScript6 compatible promise. If no url is provided, the method does nothing. If only a url is provided, it assumes you are doing a GET. Because Bitsy uses ECMAScript promises, you can skip a typical success handler and instead use the promise "then" chain for your purposes. You can perform an Ajax request as follows:


```
$(function() {
  // Get a promise from an Ajax request:
  var Fragrances = $.ajax({
    url: 'http://myAwesomeServer.com/data/fragrances.json',
    type: 'GET',
    dataType: 'json'
  });

  // Use the promise returned by the request:
  Fragrances.then(function(data){
    var list = $('ul');
    data.forEach(function(item) {
      $.append(list, '<li><strong>' + item.name + '</strong> <span>price: ' + item.price + '</span></li>');
    });
  })
  .catch(error) {
    console.log(error);
  });
});
```

Using promises, you can make mutliple Ajax requests, then process them altogether. We can do this by creating a new promise for each request, then pushing that promise into an array. Then we would just pass that array as an argument to `Promise.all()` and handle the final action in its `then` method:


```
var request1 = $.ajax({
  url: 'http://myAwesomeServer.com/data/stuff1.json',
  type: 'GET',
  dataType: 'json'
});
var request2 = $.ajax({
  url: 'http://myAwesomeServer.com/data/stuff2.json',
  type: 'GET',
  dataType: 'json'
});
var request2 = $.ajax({
  url: 'http://myAwesomeServer.com/data/stuff2.json',
  type: 'GET',
  dataType: 'json'
});
Promise.all(promiseArray).then(function(promiseArray){
  // Do what you need to here.
})
.catch(function(error) {
  // Handle any error here.
  console.log(error.message);
});
```

You can also use the `race` method to do something with the first promise resovles:

```
var request1 = $.ajax({
  url: 'http://myAwesomeServer.com/data/stuff1.json',
  type: 'GET',
  dataType: 'json'
});
var request2 = $.ajax({
  url: 'http://myAwesomeServer.com/data/stuff2.json',
  type: 'GET',
  dataType: 'json'
});
var request2 = $.ajax({
  url: 'http://myAwesomeServer.com/data/stuff2.json',
  type: 'GET',
  dataType: 'json'
});
Promise.race(promiseArray).then(function(promiseArray){
  // Handle the first promise to finish.
})
.catch(function(error) {
  // Handle any error here.
});
```


###$.get

Bitsy has shortcuts so you don't have to type as much:

```
var Request = $.get('http://mydomain.com/data.json');
Request.then(function(json) {
  var list = $('ul');
  // Do something with "json" object.
  // You need to parse it first:
  var data = JSON.parse(json);
  data.forEach(function(item) {
    $.append(list, '<li>' + item.name + '</li>')
  });
})
.catch(function(error) {
  console.log(error.message);
})
```

You could also use `$.get` to retrieve a fragment of html:

```
var fragment = $.get('http://myDomain.com/docs/frag1.html');
fragment.then(function(html) {
  var list = $('#list');
  $.append(list, html);
})
.catch(function(error) {
  console.log(error.message);
});
```

Please note that if you are getting JSON with `$.get`, you will need to process if first with `JSON.parse()` before you can use it. If you want to just get JSON, best to use the shortcut descibed next.

###$.getJSON

If you're only retrieving JSON data, you can use the following shortcut. This will automatically return a parsed JSON object for you:

```
var stuff = $.getJSON('http://mydomain.com/data/stuff.json');
stuff.then(function(data) {
  var list = $('ul');
  // Use JSON:
  data.forEach(function(item) {
    $.append(list, '<li>' + item.name + ': quantity: ' + item.quantity + '</li>');
  });
})
.catch(function(error) {
  console.log(error.message);
});
```

###$.JSONP

Bitsy provides a convenient way to perfom JSONP requests.

```
var someStuff = $.JSONP({ url: 'https://api.github.com/users/yui?callback=?'});
// Handle promise:
someStuff.then(function(lib) {
  var list = $('.list');
  $.append(list, <li><h3>The name of the library</h3><h4>' + lib.data.name + '</h4></li>');
});

// Get data for postcode:
var postalCode = $.JSONP({ url: 'http://www.geonames.org/postalCodeLookupJSON?postalcode=94102&country=US&callback=?' });
postalCode.then(function(data){
  var list = $('.list');
  $.append(list, '<li><h3>My Location</h3><h4>' + data.postalcodes[0].adminName2 + ', ' + data.postalcodes[0].adminName1 + '</h4></li>');
});
```

With a timeout:

```
var postalCode = $.JSONP({
  url: 'http://www.geonames.org/postalCodeLookupJSON?postalcode=94102&country=US&callback=?', 
  // 5 second timeout:
  timeout: 5000
});
// Handle promise:
postalCode.then(function(data){
  var list = $('.list');
  $.append(list, '<li><h3>My Location</h3><h4>' + data.postalcodes[0].adminName2 + ', ' + data.postalcodes[0].adminName1 + '</h4></li>');
})
.catch(function(error) {
  console.log(error.message);
});
```

###$.post

```
// Simple post with some data:
$.post("updateUser.php", 
  { "name": "Joe", "time": "10PM" }, 
  function() {
    console.log('The POST was successful.')
  },
  "json"
);

// 
$.post("updateUser.php", 
{ 
  "name": "Joe", 
  "time": "10PM" 
})
.then(function() {
  function() {
    console.log('The POST was successful.')
  }  
})
.catch(function() {
  console.log('There was a problem posting.')
});
```

<a name="styles"></a>
##11. Get and Set Styles

Bitsy has to methods to get and set styles on an element. The first argument is the element. If you want to set styles, the second argument would be the styles.

####$.getStyle

To get the style of an element, use `$.getStyle`. The first argument is the element, the second is the style property you are interested in. For complex styles, use their hyphenated versions, not their camel-case versions:

```
var listItem = $('li');
var color = $.getStyle(listItem, 'background-color');
console.log(color);
```

When getting colors, be aware that even if you've used a CSS color name for a color, such as "red" or "blue", when return the color value, the browser will return it as the value that it uses  internally to render color. Depending on the browser, this may be an rgb/rgba value or a hex value. Similarly, when getting dimensions, such as width and height, `$.getStyle` with return the value with the length identifier, such as `100px`, as the value. You can use `parseInt()` to convert these values to integers for math purposes.

####$.setStyle

Setting the style on an element is easy, just provide the element and the style you want to set. Use the hyphenated version for complex style terms. For lengths, please provide proper length identifiers: "px" for pixels, etc. `$.setStyle` expects and object literal with quoted values:

```
var listItem = $('li');
$.setStyle(listItem, {'background-color': '#fafafa', 'color': '#666', 'padding': '4px 20px', 'border': "solid 1px #666"});
```


<a name="modifiers"></a>
##12. Prepend, Append, Before, After, Make and Closest

Bitsy provides a number of methods to make it easy for you to deal with mannipulating the DOM. These are


- $.prepend - insert the element(s) at the start of an element
- $.append - insert the element(s) at the end of an element
- $.before - insert the elements(s) before an element
- $.after - insert the element(s) after and element
- $.make - convert markup into DOM nodes
- $.closest - get an element's ancestor based on the provided selector.



###$.make

This method allows you to create nodes from markup. The markup must be valid or it may throw errors or create a structure you were not expecting:

```
var list = $.make('<ul></ul>');
var listItem = $.make('<li>This is a new created list item</li>');

// Create a nest node structure:

var fullList = $.make('<ul class="list"><li>one</li><li>two</li><li>three</li></ul>');
// creates:
/*
<ul class="list">
  <li>one</li>
  <li>two</li>
  <li>three</li>
</ul>
*/
```

You can use the folowing methods to insert newly created nodes into the document.

###$.prepend

The method allows you to insert a node or set of nodes at the begining of a container, before whatever its first child node is:

```
var item = $.make('<li>A new list item</li>');
// Get a reference to a list:
var list = $('ul');

// Append the new node after the list's other items:
$.prepend(list, item);

// Use a for loop to append multiple nodes.
// We need to prepend them from the end
// so that they are in the correct order:
var items = ["one", "two", "three"];
for (var i = items.length; i >= 0; i--) {
  $.prepend(list, '<li>' + items[i]+ '</li>');
}
```


###$.append

The method allows you to insert a node or set of nodes at the end of a container, after whatever its last child node is:

```
var item = $.make('<li>A new list item</li>');
// Get a reference to a list:
var list = $('ul');

// Append the new node after the list's other items:
$.append(list, item);

// Use a loop to append multiple nodes:
var items = ["one", "two", "three"];
items.forEach(function(item) {
  $.append(list, '<li>' + item + '</li>');
});
```

###$.before

This method will insert a node before another node so that it becomes that node's previous sibling:

```
var list = $('ul');
$.before(list, '<h2>This is the list title</h2>');
```

###$.after

This method inserts a node after another node so that it becomes that node's next sibling:

```
var list $('ul');
$.after(list, '<p>This is the list\'s footer.</p>');
```

###$.closest

This works like the jQuery namesake, it returns the first occurence of an ancestor node that matches the selector provided:

```
var element = $('#myElem');

// Get the first div that is element's ancestor node:
var divAncestor = $.closest(element, 'div');

// Get the first section that is element's ancestor node:
var divSection = $.closest(element, 'section');
```


For other type of DOM queries, you can use the following:

```
var element = $('#myFavElement');

// Its next sibling:
element.nextElementSibling;

// Its previous sibling:
element.previousElementSibling;

// Its child nodes:
element.children;

// Its first child node:
element.firstElementChild;

// Its last child node:
element.lastElementChild;

// Its parent node:
element.parentElement;
```

