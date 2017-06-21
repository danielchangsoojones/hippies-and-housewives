var Parse = require('parse/node');
var className = "Initiate";

class Initiate extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, Initiate);
module.exports = Initiate;