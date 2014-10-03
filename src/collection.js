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