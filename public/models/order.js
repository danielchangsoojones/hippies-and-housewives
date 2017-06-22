var Parse = require('parse/node');
var CustomParseObject = require("./super.js");
var className = "Order";

class Order extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Order);
module.exports = Order;
exports.order = new Order();