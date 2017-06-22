var Parse = require('parse/node');
var CustomParseObject = require("../super.js");
var className = "Cut";

class Cut extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Cut);
module.exports = Cut;
exports.cut = new Cut();