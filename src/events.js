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