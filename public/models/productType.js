var Parse = require('parse/node');
var CustomParseObject = require("./super.js");
var className = "ProductType";

class ProductType extends CustomParseObject {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, ProductType);
module.exports = ProductType;
exports.productType = new ProductType();