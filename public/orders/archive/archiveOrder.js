var Parse = require('parse/node');
var request = require('request');

exports.archiveShopifyOrder = function archiveShopifyOrder(shopifyOrderID) {
    var promise = new Parse.Promise();
    
    //close the actual shopify order
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders/' + shopifyOrderID + "/close.json";
    request.post({url: shopifyURL, qs: {}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //after we have updated the order, this should automatically send a webhook to update line items to archive state
            //therefore, we don't need to manually archive the line items here.
            let success = true;
            promise.resolve(success);
        } else {
            promise.resolve(error);
        }
    });

    return promise;
}