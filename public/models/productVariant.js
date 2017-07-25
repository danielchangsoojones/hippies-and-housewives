var Parse = require('parse/node');
var CustomParseObject = require("./super.js");
var className = "ProductVariant";

class ProductVariant extends CustomParseObject {
  constructor() {
    super(className);
  }

  static sizes() {
    let sizes = {
      XS: "XS",
      S: "S",
      M: "M",
      L: "L",
      XL: "XL",
      XXL: "XXL",
      one_size: "One Size"
    }
    return sizes;
  }

  static longSizes(sizeTitle) {
    switch (sizeTitle) {
      case "Small":
        return this.sizes().S;
      case "Medium":
        return this.sizes().M;
      case "Large":
        return this.sizes().L;
      case "X-Large":
        return this.sizes().XL;
      default:
        return undefined;
    }
  }
}

Parse.Object.registerSubclass(className, ProductVariant);
module.exports = ProductVariant;
exports.productVariant = new ProductVariant();