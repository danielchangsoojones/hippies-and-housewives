var Parse = require('parse/node');
var className = "Product";

class Product extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, Product);
module.exports = Product;