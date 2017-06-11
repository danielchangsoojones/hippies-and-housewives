var Parse = require('parse/node');
var request = require('request');

exports.checkIfOrderShouldArchive = function checkIfOrderShouldArchive(orderID) {
    var promise = new Parse.Promise();

    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);

    var Order = Parse.Object.extend("Order");
    let innerQuery = new Parse.Query(Order);
    innerQuery.equalTo("objectId", orderID);
    query.matchesQuery("order", innerQuery);
    
    query.include("order");
    query.find({
      success: function(lineItems) {
          if (allLineItemsFinished(lineItems)) {
              archiveOrder(lineItems).then(function(lineItems) {
                  promise.resolve(lineItems);
              }, function(error) {
                  promise.reject(error);
              });
          } else {
              promise.reject("could not archive order because not all line items are shipped yet");
          }
      },
      error: function(error) {
          promise.reject(error);
      }
    });

    return promise;
}

function allLineItemsFinished(lineItems) {
    for (var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        if (lineItem.get("isShipped") != true) {
            //a line item in the order has not shipped yet
            return false
        }
    }

    //all line items are finished
    return true
}

function archiveOrder(lineItems) {
    var promise = new Parse.Promise();
    
    //close the actual shopify order
    let order = lineItems[0].get("order");
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders/' + order.get("shopifyID") + "/close.json";
    request.post({url: shopifyURL, qs: {}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //after we have updated the order, this should automatically send a webhook to update line items to archive state
            //therefore, we don't need to manually archive the line items here.
            promise.resolve(lineItems);
        } else {
            promise.resolve(error);
        }
    });

    return promise;
}