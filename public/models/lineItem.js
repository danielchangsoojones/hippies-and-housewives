var Parse = require('parse/node');
var CustomParseObject = require("./super.js");
var className = "LineItem"

class LineItem extends CustomParseObject {
  constructor() {
    super(className);
  }
}

Parse.Object.registerSubclass(className, LineItem);
module.exports = LineItem;
exports.lineItem = new LineItem();