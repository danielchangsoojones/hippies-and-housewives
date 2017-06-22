var Parse = require('parse/node');
var CustomParseObject = require("../super.js");
var className = "Package";

class Package extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Package);
module.exports = Package;
exports.package = new Package();