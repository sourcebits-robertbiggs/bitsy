
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