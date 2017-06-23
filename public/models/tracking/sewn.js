var Parse = require('parse/node');
var CustomParseObject = require("../super.js");
var className = "Sewn";

class Sewn extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Sewn);
module.exports = Sewn;