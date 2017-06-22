var Parse = require('parse/node');
var CustomParseObject = require("./super.js");
var className = "Fabric";

class Fabric extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Fabric);
module.exports = Fabric;
exports.fabric = new Fabric();