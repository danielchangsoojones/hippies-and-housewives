var Parse = require('parse/node');
var className = "Cut";

class Cut extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, Cut);
module.exports = Cut;