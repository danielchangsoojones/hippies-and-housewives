var Parse = require('parse/node');
var className = "Address";

class Address extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, Address);
module.exports = Address;