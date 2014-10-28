/*
BitsJS
Copyright 2014 Sourcebits www.sourcebits.com
Version: 1.0.1
*/

//////////////////////////////
// Add selector and DOM ready:
//////////////////////////////


(function(exports) {
  var $ = function(selector) {
    if (typeof selector === 'function') {
      document.addEventListener('DOMContentLoaded', function(e) {
        return selector.call(selector);
      });
    } else if (typeof selector === 'string'){
      return document.querySelector(selector);
    } else if (selector.nodeType === 1) return selector;
  };

  // Export $:
  exports.$ = $;
})(this);
///////////////////
// Object extender:
///////////////////

$.extend = function(obj, prop, enumerable) {
  enumerable = enumerable || false;
  if (!prop && typeof obj === 'object') {
    prop = obj;
    obj = $;
  }
  Object.keys(prop).forEach(function(p) {
    if (prop.hasOwnProperty(p)) {
      Object.defineProperty(obj, p, {
        value: prop[p],
        writable: true,
        enumerable: enumerable,
        configurable: true
      });
    }
  });
  return this;
};
/////////////////////////
// Return array of nodes:
/////////////////////////
(function(exports) {
  $.extend({
    $$ : function( selector, context ) {
      if (!selector) return;
      if (context && typeof context === 'string') {
        return [].slice.apply($(context).querySelectorAll(selector));
      } else if (context && context.nodeType === 3) {
        return [].slice.apply(context.querySelectorAll(selector));
      }
      if (typeof selector === 'string') {
        return [].slice.apply(document.querySelectorAll(selector));
      } else if (selector && selector.nodeType === 3) {
        return selector;
      }
    }
  });

  // Export $$:
  exports.$$ = $.$$;
})(this);
(function(exports) {

  ///////////////////////
  // Dependency Injector:
  ///////////////////////
  var Injector = function(fn) {
    // Store for dependencies
    //=======================
    this.dependencies = [];

    // Run the code with dependencies:
    //================================
    this.run = function(fn) {
      var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
      var FN_STRING = fn.toString();
      console.log(FN_STRING.match(FN_ARGS));
      var args = FN_STRING.match(FN_ARGS)[1].split(',');
      args = args.map(function(value) {
        return value.trim();
      });
      fn.apply(fn, this.get(args));
    };

    // Semantic alias for run function
    // because dependencies are injected
    // into the argument passed to it.
    //==================================
    this.injectInto = function(fn) {
      return this.run(fn);
    };

    // Map dependencies:
    //==================
    this.get = function(arr) {
      var self = this;
      return arr.map(function(value) {
          return self.dependencies[value];
      });            
    };

    // Register a string name to dependency:
    //======================================
    this.map = function(name, dependency) {
      this.dependencies[name] = dependency;
    }
  }

  // Export Injector:
  exports.Injector = Injector;
})(this);
///////////
// Pub/Sub:
///////////

$.extend({

  // Create Uuid:
  UuidBit : 1,

  Uuid : function() {
    this.UuidBit++
    return Date.now().toString(36) + this.UuidBit;
  },  

  subscriptions : {},

  // Topic: string defining topic: /some/topic
  // Data: a string, number, array or object.
  subscribe : function (topic, callback) {
    if (!$.subscriptions[topic]) {
      $.subscriptions[topic] = [];
    }
    var token = ($.Uuid());
    $.subscriptions[topic].push({
      token: token,
      callback: callback
    });
    return token;
  },

  unsubscribe : function ( token ) {
    setTimeout(function() {
      for (var m in $.subscriptions) {
        if ($.subscriptions[m]) {
          for (var i = 0, len = $.subscriptions[m].length; i < len; i++) {
            if ($.subscriptions[m][i].token === token) {
              $.subscriptions[m].splice(i, 1);
              return token;
            }
          }
        }
      }
      return false;
    });
  },

  publish : function ( topic, args ) {
    if (!$.subscriptions[topic]) {
      return false;
    }
    setTimeout(function () {
      var len = $.subscriptions[topic] ? $.subscriptions[topic].length : 0;
      while (len--) {
        $.subscriptions[topic][len].callback(topic, args);
      }
      return true;
    });
    return true;
 }
});
//////////////////////////////////////////
// Plugin to setup automatic data binding:
//////////////////////////////////////////
$.extend($, {
  bindData : function () {

    var controllers = $$('[data-controller]');
    var broadcasts = [];

    // Define function to create broadcasts:
    //======================================
    var createBroadcaster = function(controller) {
      var broadcast = 'data-binding-' + $(controller).getAttribute('data-controller');
      broadcasts.push(broadcast);
    };

    // Loop controllers, create broadcasts,
    // subscribe models to broadcasts:
    //=====================================
    controllers.forEach(function(ctx, idx) {
      var model = ctx.getAttribute('data-controller');
      createBroadcaster(ctx);
      // Subscribe and update elements with data:
      $.subscribe(broadcasts[idx], function(event, value) {
        var element = '[data-model=' + model + ']';
        $(element).innerText = value;
      });
    });

    // Bind events to controllers to publish broadcasts:
    //==================================================
    $.on($('body'), '[data-controller]', 'input', function(event) {
      var broadcast = 'data-binding-' + this.getAttribute('data-controller');
      $.publish(broadcast, this.value);
    });
  }
});
/////////////
// Templates:
/////////////
$.extend({
/////////////////////////////
// Templating:
/////////////////////////////
  templates : {},
 
  template : function ( tmpl, variable ) {
    var regex;
    variable = variable || 'data';
    regex = /\[\[=([\s\S]+?)\]\]/g;
    var template =  new Function(variable, 
      "var p=[];" + "p.push('" + tmpl
      .replace(/[\r\t\n]/g, " ")
      .split("'").join("\\'")
      .replace(regex, "',$1,'")
      .split('[[').join("');")
      .split(']]').join("p.push('") + "');" +
      "return p.join('');");
    return template;
  }
});
(function() {
  /*jshint validthis:true */
  var extend;
  var cycle;
  var queue;

  extend = function(obj, name, val, config) {
    return Object.defineProperty(obj, name, {
      value: val,
      writable: true,
      configurable: config !== false
    });
  };

  queue = (function() {
    var first, last, item;

    function Item(fn,self) {
      this.fn = fn;
      this.self = self;
      this.next = undefined;
    }

    return {
      add: function (fn, self) {
        item = new Item(fn, self);
        if (last) {
          last.next = item;
        }
        else {
          first = item;
        }
        last = item;
        item = undefined;
      },
      unshift: function() {
        var f = first;
        first = last = cycle = undefined;

        while (f) {
          f.fn.call(f.self);
          f = f.next;
        }
      }
    };
  })();

  function schedule(fn, self) {
    queue.add(fn,self);
    if (!cycle) {
      cycle = setTimeout(queue.unshift);
    }
  }

  // Check that Promise is thenable:
  function isThenable(obj) {
    var _then, obj_type = typeof obj;

    if (obj !== null &&
      (
        obj_type === "object" || obj_type === "function"
      )
    ) {
      _then = obj.then;
    }
    return typeof _then === "function" ? _then : false;
  }

  function notify() {
    for (var i = 0; i < this.chain.length; i++) {
      notifyIsolated(
        this,
        (this.state === 1) ? this.chain[i].success : this.chain[i].failure,
        this.chain[i]
      );
    }
    this.chain.length = 0;
  }

  function notifyIsolated(self, callback, chain) {
    var ret, _then;
    try {
      if (callback === false) {
        chain.reject(self.msg);
      } else {
        if (callback === true) {
          ret = self.msg;
        } else {
          ret = callback.call(undefined, self.msg);
        }
        if (ret === chain.promise) {
          chain.reject(new TypeError("Promise-chain cycle"));
        } else if (_then = isThenable(ret)) {
          _then.call(ret, chain.resolve, chain.reject);
        } else {
          chain.resolve(ret);
        }
      }
    }
    catch (err) {
      chain.reject(err);
    }
  }

  function resolve(msg) {
    var _then, deferred, self = this;
    if (self.triggered) { return; }
    self.triggered = true;
    if (self.deferred) {
      self = self.deferred;
    }

    try {
      if (_then = isThenable(msg)) {
        deferred = new MakeDeferred(self);
        _then.call(msg,
          function() { resolve.apply(deferred, arguments); },
          function() { reject.apply(deferred, arguments); }
        );
      } else {
        self.msg = msg;
        self.state = 1;
        if (self.chain.length > 0) {
          schedule(notify,self);
        }
      }
    }
    catch (err) {
      reject.call(deferred || (new MakeDeferred(self)), err);
    }
  }

  function reject(msg) {
    var self = this;
    if (self.triggered) { return; }
    self.triggered = true;
    if (self.deferred) {
      self = self.deferred;
    }
    self.msg = msg;
    self.state = 2;
    if (self.chain.length > 0) {
      schedule(notify, self);
    }
  }

  function iteratePromises(Constructor, arr, resolver, rejecter) {
    for (var idx = 0; idx < arr.length; idx++) {
      (function IIFE(idx) {
        Constructor.resolve(arr[idx])
        .then(
          function(msg) {
            resolver(idx, msg);
          },
          rejecter
        );
      })(idx);
    }
  }

  function MakeDeferred(self) {
    this.deferred = self;
    this.triggered = false;
  }

  function Deferred(self) {
    this.promise = self;
    this.state = 0;
    this.triggered = false;
    this.chain = [];
    this.msg = undefined;
  }

  function Promise(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("Not a function");
    }

    if (this.isValidPromise !== 0) {
      throw new TypeError("Not a promise");
    }

    // Indicate the Promise is initialized:
    this.isValidPromise = 1;

    var deferred = new Deferred(this);

    this.then = function(success, failure) {
      var obj = {
        success: typeof success === "function" ? success : true,
        failure: typeof failure === "function" ? failure : false
      };
      // `.then()` can be used against a different promise 
      // constructor for making a chained promise.
      obj.promise = new this.constructor(function extractChain(resolve,reject) {
        if (typeof resolve !== "function" || typeof reject !== "function") {
          throw new TypeError("Not a function");
        }

        obj.resolve = resolve;
        obj.reject = reject;
      });
      deferred.chain.push(obj);

      if (deferred.state !== 0) {
        schedule(notify, deferred);
      }

      return obj.promise;
    };
    this["catch"] = function(failure) {
      return this.then(undefined, failure);
    };

    try {
      executor.call(
        undefined,
        function(msg) {
          resolve.call(deferred, msg);
        },
        function(msg) {
          reject.call(deferred, msg);
        }
      );
    }
    catch (err) {
      reject.call(deferred, err);
    }
  }

  var PromisePrototype = extend({}, "constructor", Promise, false
  );

  extend(
    Promise,"prototype", PromisePrototype, false
  );

  // Check if Promise is initialized:
  extend(PromisePrototype, "isValidPromise", 0, false
  );

  extend(Promise, "resolve", function (msg) {
    var Constructor = this;

    // Make sure it is a valide Promise:
    if (msg && typeof msg === "object" && msg.isValidPromise === 1) {
      return msg;
    }

    return new Constructor(function executor(resolve,reject) {
      if (typeof resolve !== "function" || typeof reject !== "function") {
        throw new TypeError("Not a function");
      }

      resolve(msg);
    });
  });

  extend(Promise, "reject", function (msg) {
    return new this(function executor(resolve, reject) {
      if (typeof resolve !== "function" || typeof reject !== "function") {
        throw new TypeError("Not a function");
      }

      reject(msg);
    });
  });

  extend(Promise, "all", function (arr) {
    var Constructor = this;

    // Make sure argument is an array:
    if (Object.prototype.toString.call(arr) !== "[object Array]") {
      return Constructor.reject(new TypeError("Not an array"));
    }
    if (arr.length === 0) {
      return Constructor.resolve([]);
    }

    return new Constructor(function executor(resolve,reject) {
      if (typeof resolve !== "function" || typeof reject !== "function") {
        throw new TypeError("Not a function");
      }

      var len = arr.length, msgs = new Array(len), count = 0;

      iteratePromises(Constructor, arr, function resolver(idx, msg) {
        msgs[idx] = msg;
        if (++count === len) {
          resolve(msgs);
        }
      },reject);
    });
  });

  extend(Promise, "race", function (arr) {
    var Constructor = this;

    // Make sure argument is an array:
    if (Object.prototype.toString.call(arr) !== "[object Array]") {
      return Constructor.reject(new TypeError("Not an array"));
    }

    return new Constructor(function executor(resolve, reject) {
      if (typeof resolve !== "function" || typeof reject !== "function") {
        throw new TypeError("Not a function");
      }

      iteratePromises(Constructor, arr, function resolver(idx, msg) {
        resolve(msg);
      },reject);
    });
  });
  // If native Promise exists in window, do not use this.
  if ("Promise" in window && "resolve" in window.Promise && "reject" in window.Promise && "all" in window.Promise && "race" in window.Promise) {
    return;
  } else {
    // Otherwise do use this:
    return window.Promise = Promise;
  }
})();
////////////////
// Ajax & JSONP:
////////////////

$.extend($, {
  /*
    options = {
      url : 'the/path/here',
      type : ('GET', 'POST', PUT, 'DELETE'),
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
  */
  ajax: function(options) {
    if (!options) throw('No options where provided to xhr request.');
    if (typeof options !== 'object') throw('Expected an object as argument for options, received something else.');
    var protocol;
    // Default settings:
    var settings = {
      type: 'GET',
      beforeSend: $.noop,
      success: $.noop,
      error: $.noop,
      context: null,
      async: true,
      timeout: 0,
      data: null
    };
    if (options.data) {
      options.data = encodeURIComponent(options.data);
    }
    $.extend(settings, options);
    var dataTypes = {
      script: 'text/javascript, application/javascript',
      json: 'application/json',
      xml: 'application/xml, text/xml',
      html: 'text/html',
      text: 'text/plain'
    };

    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      var type = settings.type;
      var async  = settings.async;      
      var params = settings.data;
      xhr.queryString = params;
      xhr.timeout = settings.timeout ? settings.timeout : 0;
      xhr.open(type, settings.url, async);

      // Setup headers:
      if (!!settings.headers) {  
        for (var prop in settings.headers) { 
          if(settings.headers.hasOwnProperty(prop)) { 
            xhr.setRequestHeader(prop, settings.headers[prop]);
          }
        }
      }
      if (settings.dataType) {
        xhr.setRequestHeader('Content-Type', dataTypes[settings.dataType]);
      }

      // Get the protocol being used:
      protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol;
      // Send request:

      // Handle load success:
      xhr.onload = function() {
        if (xhr.status === 200 && xhr.status < 300 && xhr.readyState === 4 || xhr.status === 304 && xhr.readyState === 4 || (xhr.status === 0 && protocol === 'file:')) {
          // Resolve the promise with the response text:
          resolve(xhr.response);
        } else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error:
          reject(new Error(xhr.statusText));
        }
      };

      // Handle error:
      xhr.onerror = function() {
        reject(new Error("There was a network error."));
      };

      // Send request:
      if (async) {
        if (settings.beforeSend !== $.noop) {
          settings.beforeSend(xhr, settings);
        }
        xhr.send(params);
      } else {
        if (settings.beforeSend !== $.noop) {
          settings.beforeSend(xhr, settings);
        }
      }

    });
  }
});
$.extend($, {
  // Parameters: url, data, success, dataType.
  get : function ( url, data, success, dataType ) {
    if (!url) {
      return;
    }
    if (!data) {
      return $.ajax({url : url, type: 'GET'}); 
    }
    if (!dataType) {
      dataType = null;
    }
    if (typeof data === 'function' && !success) {
      return $.ajax({url : url, type: 'GET', success : data});
    } else if (typeof data === 'string' && typeof success === 'function') {
      return $.ajax({url : url, type: 'GET', data : data, success : success, dataType : dataType});
    }
  },
  
  // Parameters: url, data, success.
  getJSON : function ( url, data, success ) {
    if (!url) {
      return;
    }
    if (!data) {
      return;
    }
    if (typeof data === 'function' && !success) {
      return $.ajax({url : url, type: 'GET', async: true, success : data, dataType : 'json'});
    } else if (typeof data === 'string' && typeof success === 'function') {
      return $.ajax({url : url, type: 'GET', data : data, success : success, dataType : 'json'});
    }
  },

  /*
    // JSONP arguments:
    var options = {
      url: 'http:/whatever.com/stuff/here',
      callback: function() {
         // do stuff here
      },
      callbackType: 'jsonCallback=?',
      timeout: 5000
    }
  */
  JSONP : function ( options ) {
    var settings = {
      url : null,
      callback: $.noop,
      callbackType : 'callback=?',
      timeout: null
    };
    $.extend(settings, options);
    //var deferred = new $.Deferred();
    var fn = 'fn_' + $.uuidNum(),
    script = document.createElement('script'),
    head = $('head')[0];
    script.setAttribute('id', fn);
    var startTimeout = new Date();
    window[fn] = function(data) {
      head.removeChild(script);
      settings.callback(data);
      deferred.resolve(data, 'resolved', settings);
      delete window[fn];
    };
    var strippedCallbackStr = settings.callbackType.substr(0, settings.callbackType.length-1);
    script.src = settings.url.replace(settings.callbackType, strippedCallbackStr + fn);
    head.appendChild(script);
    if (settings.timeout) {
      var waiting = setTimeout(function() {
        if (new Date() - startTimeout > 0) {
          deferred.reject('timedout', settings);
          settings.callback = $.noop;
        }
      }, settings.timeout);
    }
    //return deferred;
    return new Promise(function(resolve, reject) {
      var fn = 'fn_' + $.uuidNum(),
      script = document.createElement('script'),
      head = $('head')[0];
      script.setAttribute('id', fn);
      var startTimeout = new Date();
      window[fn] = function(data) {
        head.removeChild(script);
        settings.callback(data);
        resolve(data);
        //deferred.resolve(data, 'resolved', settings);
        delete window[fn];
      };
      var strippedCallbackStr = settings.callbackType.substr(0, settings.callbackType.length-1);
      script.src = settings.url.replace(settings.callbackType, strippedCallbackStr + fn);
      head.appendChild(script);
      if (settings.timeout) {
        var waiting = setTimeout(function() {
          if (new Date() - startTimeout > 0) {
            //deferred.reject('timedout', settings);
            reject('The request timedout.');
            settings.callback = $.noop;
          }
        }, settings.timeout);
      }        
    });
  },
  
  // Parameters: url, data, success, dataType.
  post : function ( url, data, success, dataType ) {
    if (!url) {
      return;
    }
    if (!data) {
      return;
    }
    if (!dataType && typeof success !== 'function') {
      return $.ajax({url: url, type: 'POST', data: data, dataType: success});
    }
    if (typeof data === 'function' && !dataType) {
      if (typeof success === 'string') {
         dataType = success;
      } else {
        dataType = 'form';
      }
      return $.ajax({url : url, type: 'POST', success : data, dataType : dataType});
    } else if (typeof data === 'string' && typeof success === 'function') {
      if (!dataType) {
        dataType = 'form';
      }
      return $.ajax({url : url, type: 'POST', data : data, success : success, dataType : dataType});
    }
  }
});
// CSS module
// $.getStyle, $.setStyle:
$.extend({
  // Camelize hyphenated term:
  camelize : function ( string ) {
    if (typeof string !== 'string') return;
    return string.replace(/\-(.)/g, function(match, letter){return letter.toUpperCase();});
  },
  
  // Convert camel case to hyphenated term:
  deCamelize : function ( string ) {
    if (typeof string !== 'string') return;
    return string.replace(/([A-Z])/g, '-$1').toLowerCase();
  },

  // Pass name of property: "width"
  getStyle : function ( element, property ) {
    if (!element || !property) return;
    return document.defaultView.getComputedStyle(element, null).getPropertyValue(property.toLowerCase());
  },

  // Expects style as object: {color: "red",width: "20px"}
  setStyle : function ( element, style ) {
    if (!element || !style) return;
    for (var key in style) {
      if (style.hasOwnProperty(key)) {
        element.style[$.camelize(key)] = style[key];
      }
    }
  },

  // Prepend:
  prepend : function (element, selector) {
    if (!element || !element.nodeName === 1) return;
    if (typeof selector === 'string') {
      $(element).insertAdjacentHTML('afterBegin', selector);
    } else if (selector && selector.nodeType === 1) {
      $(element).insertAdjacentElement('afterBegin', selector);
    }
  },

  // Append:
  append : function (element, selector) {
    if (!element || !element.nodeName === 1) return;
    if (typeof selector === 'string') {
      $(element).insertAdjacentHTML('beforeEnd', selector);
    } else if (selector && selector.nodeType === 1) {
      $(element).insertAdjacentElement('beforeEnd', selector);
    }
  },

  // Before:
  before : function (element, selector) {
    if (!element || !element.nodeName === 1) return;
    if (typeof selector === 'string') {
      $(element).insertAdjacentHTML('beforeBegin', selector);
    } else if (selector && selector.nodeType === 1) {
      $(element).insertAdjacentElement('beforeBegin', selector);
    }
  },

  // After:
  after : function (element, selector) {
    if (!element || !element.nodeName === 1) return;
    if (typeof selector === 'string') {
      $(element).insertAdjacentHTML('afterEnd', selector);
    } else if (selector && selector.nodeType === 1) {
      $(element).insertAdjacentElement('afterEnd', selector);
    }
  },

  make : function ( HTMLString ) {
    var temp = document.createElement('div');
    temp.innerHTML = HTMLString;
    return temp.childNodes.length === 1 ? temp.firstElementChild : Array.prototype.slice.call(temp.childNodes);
  },

  closest : function( elem, selector ) {
       if (typeof selector === 'undefined') {
          return false;
       }
       var $this = $(elem);
       var idCheck = new RegExp('^#');
       var classCheck = new RegExp('^.');
       var position = null;
       var newSelector = null;
       var p = $this.parentNode;
       if (!p) {
          return false;
       }
       if (typeof selector === 'string') {
          selector.trim();
       }
       if (typeof selector === 'number') {
          position = selector || 1;
           for (var i = 1; i < position; i++) {
              if (p.nodeName === 'HTML') {
                 return p;
              } else {
                 if (p !== null) {
                    p = p.parentNode;
                 }
              }
           } 
           return p;
       } else if (selector.substr(0,1) === '.' ) {
          newSelector = selector.split('.')[1];
          if (p.nodeName === 'BODY') {
             return false;
          }
          if (p.hasClass(newSelector)) {
             return p;
          } else {
             return $.ancestor(p, selector);
          }
       } else if (selector.substr(0,1) === '#' ) {
          newSelector = selector.split('#')[1];
          if (p.getAttribute('id') === newSelector) {
             return p;
          } else {
             return $.ancestor(p, selector);
          }
       } else { 
          if (p.tagName.toLowerCase() === selector) {
             return p;
          } else {
             return $.ancestor(p, selector);
          } 
       }
    }
});
$.extend({
    
  trigger : function ( elem, event, data ) {
    var evtObj = document.createEvent('Events');
    evtObj.initEvent(event, true, false);
    if (data) evtObj.data = data;
    elem.dispatchEvent(evtObj);
  },
  
  on : function ( elem, event, selector, callback, capturePhase ) {

    // If an object literal of events:functions are passed,
    // map them to event listeners on the element:
    capturePhase = capturePhase || false;
    if (! selector && /Object/img.test(event.constructor.toString())) {
      for (var key  in event) {
        if (event.hasOwnProperty(key)) {
          $.on(elem, key, event[key]);
        }
      }
    }
    
    var __bind = function( elem, event, callback, capturePhase ) {
      capturePhase = capturePhase || false;
      return elem.addEventListener(event, callback, capturePhase);
    };

    var __delegatedFunction;
    var __delegate = function ( elem, selector, event, callback, capturePhase ) {
      capturePhase = capturePhase || false;
      
      __delegatedFunction = function(e) {
        var target = e.target;
        if (e.target.nodeType === 3) {
          target = e.target.parentNode;
        }
        $$(selector, elem).forEach(function(element) {
          if (element === target) {
            callback.call(element, e);
          } else {
            try {
              var ancestor = $.ancestor(target, selector);
              if (element === ancestor[0]) {
                callback.call(element, e);
              }
            } catch(err) {}
          }
        });
      };
      $(elem).addEventListener(event, __delegatedFunction, capturePhase);
    };      

    $.subscribe('remove-delegate', function(e, obj) {
      $(obj.elem).removeEventListener(obj.event, __delegatedFunction, obj.capturePhase);
    });

    // Check to see if event is a spaced separated list:
    // var events;
    if (typeof event === 'string') {
      event = event.trim();
      if (/\s/.test(event)) {
        events = event.split(' ');
        if (events.length) {
          events.forEach(function(evt) {
            if (typeof selector === 'function') {
              __bind(elem, evt, selector, callback);
            } else {
              __delegate(elem, selector, evt, callback, capturePhase);
            }                
          });
        }
      }
    }
    if (typeof selector === 'function') {
      __bind(elem, event, selector, capturePhase);
    } else {
      __delegate(elem, event, selector, callback, capturePhase);
    }
    return elem;
  },
  
  off : function( elem, event, selector, callback, capturePhase) {
    if (typeof selector === 'function') {
      capturePhase = callback || false;
      $(elem).removeEventListener(event, selector, capturePhase);
      return $(elem);
    } else {
      // Remove Delegate:
      capturePhase = capturePhase || false;
      $.publish('remove-delegate', {elem : elem, event: selector, capturePhase: capturePhase});
      return $(elem);
    }
  }
});
$.extend($, {

	domain : function ( ) {
		return window.location.origin;
	},
	
	path : function ( ) {
		return window.location.path;
	},
	
	// Routing interface for ChocolateChip. This allows you to use 
	// routes to trigger dynamic page manipulation. These routes also 
	// allow the browser back button to reload the previous state.
	router : {
		route : function (path) {
			if ($.router.routes.defined.hasOwnProperty(path)) {
				return $.router.routes.defined[path];
			} else {
				return new $.router.core.route(path);
			}
		},
		default : function (path) {
			$.router.routes.default = path;
		},
		error : function (fn) {
			$.router.routes.error = fn;
		},
		history : {
			pushState : function(state, title, path){
				if($.router.dispatch(path)){
					history.pushState(state, title, path);
				}
			},
			popState : function(event){
				$.router.dispatch(document.location.pathname);
			},
			observe : function(){
				window.onpopstate = $.router.history.popState;
			}
		},
		match : function (path, parameterize) {
			var params = {}, 
			route = null, 
			possible_routes, 
			slice, 
			compare;
			for (route in $.router.routes.defined) {
				if (route !== null && route !== undefined) {
					route = $.router.routes.defined[route];
					possible_routes = route.parse();
					for (var j = 0; j < possible_routes.length; j++) {
						slice = possible_routes[j];
						compare = path;
						if (slice.search(/:/) > 0) {
							for (var i = 0; i < slice.split('/').length; i++) {
								if ((i < compare.split('/').length) && (slice.split('/')[i].charAt(0) === ':')) {
									params[slice.split('/')[i].replace(/:/, '')] = compare.split('/')[i];
									compare = compare.replace(compare.split('/')[i], slice.split('/')[i]);
								}
							}
						}
						if (slice === compare) {
							if (parameterize) {
								route.params = params;
							}
							return route;
						}
					}
				}
			}
			return null;
		},
		dispatch : function (passed_route) {
			var previous_route, matched_route;
			if ($.router.routes.current !== passed_route) {
				$.router.routes.previous = $.router.routes.current;
				$.router.routes.current = passed_route;
				matched_route = $.router.match(passed_route, true);
	
				if ($.router.routes.previous) {
					previous_route = $.router.match($.router.routes.previous);
					if (previous_route !== null && previous_route._disembark !== null) {
						previous_route._disembark();
					}
				}
	
				if (matched_route !== null) {
					matched_route.execute();
					return true;
				} else {
					if ($.router.routes.error !== null) {
						$.router.routes.error();
					}
				}
			}
		},
		observe : function () {
			var fn = function(){ $.router.dispatch(location.hash); }
	
			if (location.hash === '') {
				if ($.router.routes.default !== null) {
					location.hash = $.router.routes.default;
				}
			}
	
			if ('onhashchange' in window) {
				window.onhashchange = fn;
			}
	
			if(location.hash !== '') {
				$.router.dispatch(location.hash);
			}
		},
		core : {
			'route': function (path) {
				this.path = path;
				this.action = null;
				this._beforeBoarding = null;
				this._disembark = null;
				this.params = {};
				$.router.routes.defined[path] = this;
			}
		},
		routes : {
			'current': null,
			'default': null,
			'error': null,
			'previous': null,
			'defined': {}
		}
	}
});	

$.router.core.route.prototype = {
	onboard : function (fn) {
		this.action = fn;
		return this;
	},
	beforeBoarding : function (fn) {
		this._beforeBoarding = fn;
		return this;
	},
	ondisembark : function (fn) {
		this._disembark = fn;
		return this;
	},
	parse : function () {
		var parts = [], options = [], re = /\(([^}]+?)\)/g, text;
		while (text = re.exec(this.path)) {
			parts.push(text[1]);
		}
		options.push(this.path.split('(')[0]);
		parts.forEach(function(item, idx) {
			options.push(options[idx] + item);
		});
		return options;
	},
	execute : function () {
		var halt_execution = false, result, previous;

		if ($.router.routes.defined[this.path].hasOwnProperty('_beforeBoarding')) {
			if ($.router.routes.defined[this.path]._beforeBoarding) {
				result = $.router.routes.defined[this.path]._beforeBoarding();
				if (result === false) {
					halt_execution = true;
					return;
				}
			}
		}
		if (!halt_execution) {
			$.router.routes.defined[this.path].action();
		}
	}
};
$.route = $.router.route;

$.extend($.route, {
	reroute : function ( route ) {
		window.location = window.location.host +  route;
	}
});
$.extend($, {
	defineRoutes : function ( args ) {
		args();
		$.router.observe();
	},
	paths : function ( args ) {
		args();
		$.router.observe();
	}
});
