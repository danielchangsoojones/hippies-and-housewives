var Parse = require('parse/node');
var CustomParseObject = require("../super.js");
var className = "Initiate";

class Initiate extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Initiate);
module.exports = Initiate;
exports.initiate = new Initiate();