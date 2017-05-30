var Parse = require('parse/node');
var className = "LastRetrievedOrder";

class LastRetrievedOrder extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, LastRetrievedOrder);
module.exports = LastRetrievedOrder;