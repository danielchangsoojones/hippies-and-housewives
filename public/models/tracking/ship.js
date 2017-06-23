var Parse = require('parse/node');
var CustomParseObject = require("../super.js");
var className = "Ship";

class Ship extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Ship);
module.exports = Ship;