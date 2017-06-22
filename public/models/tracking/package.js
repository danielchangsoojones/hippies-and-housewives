var Parse = require('parse/node');
var CustomParseObject = require("../super.js");
var className = "Package";

class Package extends CustomParseObject {

  constructor() {
    super(className);
  }

  static states() {
    let states = {
      in_inventory: "in inventory",
      waiting_for_identified_pick: "waiting for identified pick"
    }
    return states;
  }
}

Parse.Object.registerSubclass(className, Package);
module.exports = Package;
exports.package = new Package();