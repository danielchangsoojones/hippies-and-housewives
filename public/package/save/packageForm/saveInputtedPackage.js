var Parse = require('parse/node');

exports.saveInputtedPackage = function saveInputtedPackage(uniqueID) {
    var promise = new Parse.Promise();

    let Fetch = require("../../../items/fetch/fetchItem.js");
    Fetch.fetchItem(uniqueID).then(function(item) {
        var SavePackage = require("../savePackage.js");
        var Package = require("../../../models/tracking/package.js");
        return SavePackage.setPackage(Package.states().waiting_for_identified_pick, item);
    }).then(function(item) {
        promise.resolve(item);
    }, function(error) {
        promise.reject(error);
    })

    return promise;
}