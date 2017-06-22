var Parse = require('parse/node');
var CustomParseObject = require("./super.js");
var className = "LineItem"

class LineItem extends CustomParseObject {
  constructor() {
    super(className);
  }

  static states() {
    let states = {
      open: "open"
    }
    return states
  }

  static query() {
    let query = super.query();
    query.equalTo("state", this.states().open);
    return query;
  }
}

Parse.Object.registerSubclass(className, LineItem);
module.exports = LineItem;
exports.lineItem = new LineItem();