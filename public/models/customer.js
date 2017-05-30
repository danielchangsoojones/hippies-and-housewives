var Parse = require('parse/node');

class Customer extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super('Customer');
  }
}

Parse.Object.registerSubclass('Customer', Customer);
module.exports = Customer;