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