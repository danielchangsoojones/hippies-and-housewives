var Parse = require('parse/node');
var CustomParseObject = require("./super.js")
var className = "Item";

class Item extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, Item);
module.exports = Item;
exports.item = new Item();