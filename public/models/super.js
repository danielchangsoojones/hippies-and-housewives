var Parse = require('parse/node');

class CustomParseObject extends Parse.Object {
  constructor(className) {
    // Pass the ClassName to the Parse.Object constructor
    super(className);
  }

  static query() {
    var query = new Parse.Query(this);
    query.notEqualTo("isDeleted", true);
    return query;
  }
}

module.exports = CustomParseObject;