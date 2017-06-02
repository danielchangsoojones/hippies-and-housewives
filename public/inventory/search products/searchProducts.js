var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

exports.searchProducts = function searchProducts(searchText) {
    var promise = new Parse.Promise();

    if (typeof searchText === 'string' || searchText instanceof String) {
        //searchText is a sting
    } else {
        promise.reject("search text was not a string or undefined");
    }

    return promise;
}