var Parse = require('parse/node');
var className = "ProductVariant";

class ProductVariant extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, ProductVariant);
module.exports = ProductVariant;