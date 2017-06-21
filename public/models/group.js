var Parse = require('parse/node');
var className = "Group";

class Group extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }
}

Parse.Object.registerSubclass(className, Group);
module.exports = Group;