var Parse = require('parse/node');

exports.fetchItem = function fetchItem(uniqueID) {
    var promise = new Parse.Promise();
    let Item = require("../../models/item.js");
    let query = Item.query();
    query.equalTo("uniqueID", parseInt(uniqueID));
    query.first({
        success: function(item) {
            if (item == undefined) {
                promise.reject("no item matches this id");
            } else {
                promise.resolve(item);
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}