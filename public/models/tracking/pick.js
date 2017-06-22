var Parse = require('parse/node');
var CustomParseObject = require("../super.js");
var className = "Pick";

class Pick extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Pick);
module.exports = Pick;
exports.pick = new Pick();