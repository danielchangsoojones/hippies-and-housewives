var Parse = require('parse/node');

class Order extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super('Order');
  }
}

Parse.Object.registerSubclass('Order', Order);
module.exports = Order;