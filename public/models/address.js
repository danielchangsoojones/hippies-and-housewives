var Parse = require('parse/node');
var CustomParseObject = require("./super.js");
var className = "Address";

class Address extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Address);
module.exports = Address;
exports.address = new Address();