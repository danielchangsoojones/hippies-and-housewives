var Parse = require('parse/node');
var CustomParseObject = require("./super.js");
var className = "ProductVariant";

class ProductVariant extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, ProductVariant);
module.exports = ProductVariant;
exports.productVariant = new ProductVariant();