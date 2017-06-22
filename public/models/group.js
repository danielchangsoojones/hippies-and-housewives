var Parse = require('parse/node');
var className = "Group";
var CustomParseObject = require("./super.js");

class Group extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Group);
module.exports = Group;
exports.group = new Group();