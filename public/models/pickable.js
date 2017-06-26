var Parse = require('parse/node');
var CustomParseObject = require("../super.js");
var className = "Pickable";

class Pickable extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Pickable);
module.exports = Pickable;