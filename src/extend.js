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