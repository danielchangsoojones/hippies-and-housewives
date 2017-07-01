var Parse = require('parse/node');
var request = require("request");

exports.getAnalyticCounts = function getAnalyticCounts() {
    var promises = [];

    promises.push(getOpenOrdersCount());


    return Parse.Promise.when(promises)
}

function getOpenOrdersCount() {
    var promise = new Parse.Promise();

    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders/count.json';
    var parameters = {};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let count = JSON.parse(body).count;
            let Analytic = require("../types/analytic.js");
            console.log(Analytic.types());
            promise.resolve(count);
        } else {
            console.log(error);
        }
    });
    
    return promise;
}