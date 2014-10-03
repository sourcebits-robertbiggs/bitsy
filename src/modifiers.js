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

  ancestor : function( elem, selector ) {
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