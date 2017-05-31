var Parse = require('parse/node');
var className = "Fabric";

class Fabric extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, Fabric);
module.exports = Fabric;