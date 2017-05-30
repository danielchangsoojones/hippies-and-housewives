var Parse = require('parse/node');

class LineItem extends Parse.Object {
  constructor() {
    // Pass the ClassName to the Parse.Object constructor
    super('LineItem');
  }
}

Parse.Object.registerSubclass('LineItem', LineItem);
module.exports = LineItem;