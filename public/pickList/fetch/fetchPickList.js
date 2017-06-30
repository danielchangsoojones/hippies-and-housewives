var Parse = require('parse/node');

exports.fetchPickList = function fetchPickList() {
    var promise = new Parse.Promise();

    updatePickList();

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

/*
We aren't actually sending the newest picklist right away, but when the client calls this query, then we will run a second update to make sure that we get new ones.
*/
function updatePickList() {
    let PickList = require("../pickList.js");
    PickList.updatePickList();
}