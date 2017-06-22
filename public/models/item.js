var Parse = require('parse/node');
var className = "Item";

class Item extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }

  static query() {
    var query = new Parse.Query(this);
    query.notEqualTo("isDeleted", true);
    return query;
  }
}

Parse.Object.registerSubclass(className, Item);
module.exports = Item;
exports.item = new Item();