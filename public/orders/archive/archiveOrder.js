var Parse = require('parse/node');

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
              archive(lineItems).then(function(lineItems) {
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
        if (lineItem.get("isShipped") == false) {
            //a line item in the order has not shipped yet
            return false
        }
    }

    //all line items are finished
    return true
}

function archive(lineItems) {
    var promise = new Parse.Promise();
    //TODO: use the Shopify API to archive the order
    //TODO: then set the lineItems to archived once the shopify Order has been archived

    return promise;
}