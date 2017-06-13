var request = require('request');
require("../../resources/initializeParse.js");
var Parse = require('parse/node');
var readline = require('readline');

//MARK: mass saving orders
//start off at page 1 to get the entire orders database
// function saveAllOrders(page) {
//     //TODO: check with a query that the order doesn't exist yet, so we don't double create orders
//     let baseURL = require("../../resources/shopifyURL.js");
//     var shopifyURL = baseURL + '/orders.json';
//     var parameters = {limit : 250, page : page, status : "any", fields: "id,line_items,customer,note,name,created_at,closed_at,financial_status,cancelled_at,fulfillments,refunds"};
//     request({url: shopifyURL, qs: parameters}, function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
//             let orders = JSON.parse(body).orders;
//             if (orders.length != 0) {
//                 //still more orders to go because more exist beyond this page
//                 saveAllOrders(page + 1);
//             }

//             for (var i = 0; i < orders.length; i++) {
//                 let OrderHelper = require("../js/orders.js");
//                 OrderHelper.uploadNewOrder(orders[i]);
//             }

//         } else {
//             console.log(error);
//         }
//     });
// }

// function getPracticeOrder() {
//     let baseURL = require("../../resources/shopifyURL.js");
//     var shopifyURL = baseURL + '/orders/4920141833.json';
//     var parameters = {};
//     request({url: shopifyURL, qs: parameters}, function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
//             let order = JSON.parse(body).order;
//             let OrderHelper = require("../js/orders.js");
//             OrderHelper.uploadNewOrder(order);
//         } else {
//             console.log(error);
//         }
//     });
// }

function getDuplicateOrder() {
    let alreadyUsedOrderIDs = [];
    var duplicateOrders = [];
    
    var Order = Parse.Object.extend("Order");
    var query = new Parse.Query(Order);
    query.limit(10000);

    query.find({
      success: function(orders) {
          for (var i = 0; i < orders.length; i++) {
              let order = orders[i];
              let shopifyOrderID = order.get("shopifyID");
              if (alreadyUsedOrderIDs.indexOf(shopifyOrderID) == -1) {
                  //first time seeing this order number
                  alreadyUsedOrderIDs.push(shopifyOrderID);
              } else {
                  //it's a duplicate order number
                  duplicateOrders.push(order);
              }
          }
          deleteDuplicateOrders(duplicateOrders);
      },
      error: function(error) {
          console.log(error);
      }
    });
}

function deleteDuplicateOrders(duplicateOrders) {
    for (var i = 0; i < duplicateOrders.length; i++) {
        let order = duplicateOrders[i];
        
        var LineItem = Parse.Object.extend("LineItem");
        var query = new Parse.Query(LineItem);
        query.equalTo("order", order);

        query.find({
            success: function(lineItems) {
                //TODO: destroy all line items and the order?
            },
            error: function(error) {
                console.log(error);
            }
        });
    }
}

function archiveOrder(orderID) {
    let Archive = require("../archive/archiveOrder.js");
    Archive.checkIfOrderShouldArchive(orderID).then(function(lineItems) {
        console.log(lineItems);
    }, function(error) {
        console.log(error);
    });
}

findMatchingLineItem();

//MARK: to integrate the software with our pipeline
function findMatchingLineItem() {
    var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the style here: ', function(style) {

    rl.question('Enter the size here: ', function(size) {
        rl.close();

        var LineItem = Parse.Object.extend("LineItem");
        var query = new Parse.Query(LineItem);
        query.notEqualTo("isCut", true);
        query.notEqualTo("isSewn",true);
        query.notEqualTo("isInitiated", true);
        query.notEqualTo("isPackaged", true);
        query.notEqualTo("isPicked", true);
        query.notEqualTo("isShipped", true);

    var ProductVariant = Parse.Object.extend("ProductVariant");
    var innerQuery = new Parse.Query(ProductVariant);
    var Product = Parse.Object.extend("ProductType");
    var productQuery = new Parse.Query(Product);
    productQuery.equalTo("lowercaseTitle", style.toLowerCase().trim());
    innerQuery.equalTo("size", size.toUpperCase().trim());
    innerQuery.matchesQuery("product", productQuery);
    query.matchesQuery("productVariant", innerQuery);
    query.include("order");

    query.find({
      success: function(lineItems) {
        if (lineItems.length == 0) {
            console.log("couldn't find a match, please try re-typing and alert Daniel if that fails");
        } else {
            for (var i = 0; i < lineItems.length; i++) {
                let lineItem = lineItems[i];
                if (lineItem.get("state") == "open") {
                    saveAsCut(lineItem);
                    return;
                }
            }

            console.log("no available line items, please put it in the extra cut bucket");
        }
      },
      error: function(error) {
          console.log(error);
      }
    });
    });


    
  });
}

function saveAsCut(lineItem) {
    lineItem.set("isCut", true);
    lineItem.save(null, {
            success: function(lineItem) {
                console.log("successfully saved cut for:")
                let lineItemID = addIdDashes(lineItem.get("shopifyLineItemID"));
                let orderID = lineItem.get("order").get("name");
                console.log("OrderID: "  + orderID);
                console.log("LineItem: " + lineItem.get("title") + ", " +  lineItem.get("variant_title") + ", " + lineItemID);
            },
            error: function(error) {
                console.log(error);
            }
    });
}

function addIdDashes(id) {
    let str = id.toString();
    let dashedID = str.substring(0,3) + '-' + str.substring(3, 6) + '-' + str.substring(6);
    return dashedID;
}