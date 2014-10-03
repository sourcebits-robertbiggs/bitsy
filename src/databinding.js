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