/*
A pick list is the group of items to take from inventory and finished
packaged items. For H & H's purposes, an entire order will be pick only
when it is 100% capable of being filled. This means that every order chosen for the
pick list will have all of its line items ready.
*/
var Parse = require('parse/node');

exports.createPickList = function createPickList() {
    var promise = new Parse.Promise();

    findCompletedLineItems().then(function(completedLineItems) {
        findCompletedOrders(completedLineItems).then(function(results) {
            let filteredArray = filterArray(results);
            //For some reason, when I pass the results to Cloud code via a promise. The Object loses its class affiliation, so my iOS doesn't recieve an object, just JSON. Encoding the objects before sending to cloud code fixes this.
            promise.resolve(Parse._encode(filteredArray));
        }, function(error) {
            promise.reject(error);
        });
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

/*
A completed line item is either fulfilled via inventory or isPackaged.
The best way Daniel could think of getting 100% filled orders was to first find all items
that were completed. Then, we'll go get search the line item's orders to find any
line items in that order that aren't completed. If we get no results, then that means the order is done. It's ineffecient because you run a query
for every received line item, but it's the best way Daniel can think of accomplishing this.
*/
function findCompletedLineItems() {
    var promise = new Parse.Promise();

    var inventoryQuery = createCompletedLineItemsQuery();
    inventoryQuery.exists("inventory");

    var packagedQuery = createCompletedLineItemsQuery();
    packagedQuery.equalTo("isPackaged", true);

    var orQuery = Parse.Query.or(inventoryQuery, packagedQuery);
    orQuery.include("order");

    orQuery.find({
        success: function(lineItems) {
          promise.resolve(lineItems);
        },
        error: function(error) {
          promise.reject(error);
        }
    });

    return promise;
}

function createCompletedLineItemsQuery() {
    var LineItem = Parse.Object.extend("LineItem");
    var query = new Parse.Query(LineItem);
    query.equalTo("state", "open");
    query.notEqualTo("isPicked", true);

    return query;
}

function findCompletedOrders(completedLineItems) {
    let orderDictionary = groupLineItemsToOrders(completedLineItems);

    var promises = [];
    for(var orderID in orderDictionary) {
        let completedOrderLineItems = orderDictionary[orderID];

         var promise = runIncompleteLineItemQuery(completedOrderLineItems); 
         promises.push(promise);
    }

    //waiting for the promises to run in parallel and then we grab them all at once when they are all done.
    return Parse.Promise.when(promises);
}

function groupLineItemsToOrders(completedLineItems) {
    //{order : [line items]}
    var orderDictionary = {}
    console.log(completedLineItems.length);

    for (var i = 0; i < completedLineItems.length; i++) {
        let lineItem = completedLineItems[i];
        let order = lineItem.get("order");
        let orderID = order.id
        
        if (orderDictionary[orderID] == undefined) {
            //order key doesn't exist in dictionary yet
            orderDictionary[orderID] = [lineItem];
        } else {
            //order key already exists in dictionary because it a related line item was already iterated through
            orderDictionary[orderID].push(lineItem);
        }
    }

    console.log(orderDictionary);

    return orderDictionary
}

function runIncompleteLineItemQuery(completedLineItems) {
    var promise = new Parse.Promise();
    let order = completedLineItems[0].get("order")

    var incompleteLineItemQuery = createIncompleteLineItemQuery(order);
    incompleteLineItemQuery.first({
        success: function(lineItem) {
            if (lineItem == undefined) {
                //we couldn't find an incomplete line item, which means the entire order is ready to be picked
                promise.resolve([order, completedLineItems]);
            } else {
                //we found an incomplete line item, so don't pick this order. 
                promise.resolve(undefined);
            }
            },
            error: function(error) {
                promise.reject(error);
            }
    });

    return promise;
}

function createIncompleteLineItemQuery(order) {
    var LineItem = Parse.Object.extend("LineItem");
    var incompleteLineItemsQuery = new Parse.Query(LineItem);
    incompleteLineItemsQuery.equalTo("state", "open");
    incompleteLineItemsQuery.equalTo("order", order);
    incompleteLineItemsQuery.doesNotExist("inventory");
    incompleteLineItemsQuery.notEqualTo("isPackaged", true);
    incompleteLineItemsQuery.notEqualTo("isPicked", true);
    
    return incompleteLineItemsQuery;
}

function filterArray(array) {
    let filteredArray = array.filter(function(a){return a !== undefined})
    return filteredArray
}

