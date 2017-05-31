var Parse = require('parse/node');
var className = "ProductType";

class ProductType extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, ProductType);
module.exports = ProductType;