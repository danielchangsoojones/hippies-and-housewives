var Parse = require('parse/node');
var className = "Package";

class Package extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, Package);
module.exports = Package;