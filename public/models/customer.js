var Parse = require('parse/node');
var CustomParseObject = require("./super.js");
var className = "Customer"

class Customer extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Customer);
module.exports = Customer;
exports.customer = new Customer();