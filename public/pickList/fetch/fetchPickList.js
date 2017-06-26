var Parse = require('parse/node');

exports.fetchPickList = function fetchPickList() {
    var promise = new Parse.Promise();

    let Pickable = require("../../models/pickable.js");
    let query = Pickable.query();
    query.include("order");
    query.include("lineItems");
    query.find({
        success: function(pickables) {
            promise.resolve(Parse._encode(pickables));
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}