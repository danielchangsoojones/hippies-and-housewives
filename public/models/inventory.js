var Parse = require('parse/node');
var className = "Inventory";

class Inventory extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, Inventory);
module.exports = Inventory;