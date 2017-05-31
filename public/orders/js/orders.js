var request = require('request');
var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

// console.log(saveAllOrders(1));
console.log(getPracticeOrder());

//TODO: I can delete this once I know it works
function getPracticeOrder() {
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders.json';
    var parameters = {ids : 4913188233, status : "any"};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let orders = JSON.parse(body).orders;
            console.log("successfully got order from shopify");
            uploadNewOrder(orders[0]);
        } else {
            console.log(error);
        }
    });
}

//MARK: saving a new order
function uploadNewOrder(orderJSON) {
    let customer = createCustomer(orderJSON);
    let order = createOrder(orderJSON, customer);
    createLineItems(orderJSON, order, customer);
}

function createCustomer(orderJSON) {
    let Customer = require('../../models/customer.js');
    let customer = new Customer();

    var customerJSON = orderJSON.customer;
    if (customerJSON != undefined) {
        //sometimes orders don't have a customer
        let firstName = customerJSON.first_name;
        let lastName = customerJSON.last_name;
        customer.set("name", firstName + " " + lastName);
        customer.set("email", customerJSON.email);
        customer.set("shopifyID", customerJSON.id);
    }

    return customer
}

function createOrder(orderJSON, customer) {
    let Order = require('../../models/order.js');
    let order = new Order();
    order.set("shopifyID", orderJSON.id);
    order.set("customer", customer);
    order.set("note", orderJSON.note);
    //i.e. name = #HIPPIESANDHOUSEWIVEW1202<3
    order.set("name", orderJSON.name);
    order.set("orderPlaced", orderJSON.created_at);
    order.set("shipmentStatus", getShipmentStatus(orderJSON));
    return order
}

function createLineItems(orderJSON, order, customer) {
    let lineItemsJSON = orderJSON.line_items;
    var lineItems = [];

    for (var i = 0; i < lineItemsJSON.length; i++) {
        let lineItemJSON = lineItemsJSON[i];
        
        let getVariant = require("../../products/variant/getVariant.js");
        getVariant.findProductVariant(lineItemJSON.variant_id).then(function(variant) {
            let lineItem = createLineItem(lineItemJSON, order, orderJSON);
            lineItem.set("productVariant", variant);
            saveAllComponents([order, customer, lineItem])
        }, function(error) {
            console.log("couldn't find the variant");
            console.log(error);
        })
    }
}

function createLineItem(lineItemJSON, order, orderJSON) {
    let LineItem = require('../../models/lineItem.js');
    let lineItem = new LineItem();
    lineItem.set("shopifyLineItemID", lineItemJSON.id);
    lineItem.set("title", lineItemJSON.title);
    lineItem.set("variant_title", lineItemJSON.variant_title);
    lineItem.set("order", order);
    lineItem.set("state", getLineItemState(orderJSON));
    return lineItem
}

function saveAllComponents(objects) {
    Parse.Object.saveAll(objects, {
        success: function (results) {},
        error: function (error) {                                     
            console.log(error);
        },
    });
}

//MARK: getting order attributes
function getShipmentStatus(orderJSON) {
    let fulfillments = orderJSON.fulfillments
    //statuses: open, label printed, in-transit, delivered or failure. See Shopify Fulfillment Event documentation for better understanding
    var shipmentStatus;

    if (fulfillments.length == 0 || fulfillments[0].shipment_status == null) {
        //the order has no shipment status yet because the shipping label has not been printed yet
        shipmentStatus = "open";
    } else if (fulfillments[0].shipment_status == "confirmed") {
        //shipping label has been printed but that doesn't mean it's actually left the house. It gets confirmed right when you print the label
        shipmentStatus = "label printed";
    } else {
        //shipment status could be in-transit, delivered, or failure
        shipmentStatus = fulfillments[0].shipment_status;
    }

    return shipmentStatus
}

//MARK: get line item attributes
function getLineItemState(orderJSON) {
    var state;

    if (orderJSON.closed_at != null) {
        state = "archived";
    } else if (orderJSON.cancelled_at != null) {
        state = "cancelled";
    } else if (orderJSON.financial_status == "refunded") {
        state = "refunded";
    } else {
        state = "open";
    }

    return state;
}


//MARK: mass saving orders
//start off at page 1 to get the entire orders database
function saveAllOrders(page) {
    //TODO: check with a query that the order doesn't exist yet, so we don't double create orders
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders.json';
    var parameters = {limit : 250, page : page, status : "any", fields: "id,line_items,customer,note,name,created_at,closed_at,financial_status,cancelled_at,fulfillments"};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let orders = JSON.parse(body).orders;
            if (orders.length != 0) {
                //still more orders to go because more exist beyond this page
                saveAllOrders(page + 1);
            }

            for (var i = 0; i < orders.length; i++) {
                uploadNewOrder(orders[i]);
            }
        } else {
            console.log(error);
        }
    });
}






















function getMostRecentlySavedOrder() {
        var LastRetrievedOrder = Parse.Object.extend("LastRetrievedOrder");
        var query = new Parse.Query(LastRetrievedOrder);
        query.descending("updatedAt"); //get the latest one
        query.first({
            success: function(lastRetrievedOrder) {
                let lastRetrievedShopifyID = lastRetrievedOrder.get("shopifyOrderID");
                getAllOrders(lastRetrievedShopifyID);
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
}

function getAllOrders(lastRetrievedShopifyID) {
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders.json';
    var parameters = {limit : 250, since_id : lastRetrievedShopifyID};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let orders = JSON.parse(body).orders;
            if (orders.length == 0) {
                //we have hit the most recent order because no more exist beyond it
                saveLastShopifyID(lastRetrievedShopifyID);
            } else {
                //still more orders to go
                let lastShopifyID = orders[orders.length - 1].id
                getAllOrders(lastShopifyID);
            }

            saveCustomers(orders);
        } else {
            console.log(error);
        }
    });
}

function saveLastShopifyID(shopifyID) {
    var LastRetrievedOrder = require('../../models/lastRetrievedOrder.js');
    var lastRetrievedOrder = new LastRetrievedOrder();
    lastRetrievedOrder.set("shopifyOrderID", shopifyID);
    lastRetrievedOrder.save(null, {
        success: function(lastRetrievedOrder) {},
        error: function(gameScore, error) {
            console.log('Failed to create new last retrieved order: ' + error.message);
        }
    });
}

function saveCustomers(orders) {
    var customers = [];
    //Creating order dictionary, so when we get the customers back after saving, then we can easily see which order the customer corresponds to when saving orders.
    var orderDictionary = {};

    for (var i = 0; i < orders.length; i++) {
        let Customer = require('../../models/customer.js');
        let customer = new Customer();
        let order = orders[i];

        var customerJSON = order.customer;
        let firstName = customerJSON.first_name;
        let lastName = customerJSON.last_name;
        customer.set("name", firstName + " " + lastName);
        customer.set("email", customerJSON.email);
        customer.set("shopifyID", customerJSON.id);
        customers.push(customer);
        orderDictionary[order.id] = customer;
    }

    Parse.Object.saveAll(customers, {
        success: function (customers) {
            saveOrders(orders, orderDictionary);                               
        },
        error: function (error) {                                     
            console.log(error);
        },
    });
}

function saveOrders(ordersJSON, dictionary) {
    var orderArray = [];

    for (var i = 0; i < ordersJSON.length; i++) {
        let orderJSON = ordersJSON[i];
        let customer = dictionary[orderJSON.id];
        
        let Order = require('../../models/order.js');
        let order = new Order();
        order.set("shopifyID", orderJSON.id);
        let address = orderJSON.address1 + " " + orderJSON.city + " " + orderJSON.province_code + " " + orderJSON.zip + " " + orderJSON.country;
        order.set("shippingAddress", address);
        order.set("customer", customer);
        orderArray.push(order);
    }

    Parse.Object.saveAll(orderArray, {
        success: function (orders) {
            saveLineItems(ordersJSON, orders);                                
        },
        error: function (error) {                                     
            console.log(error);
        },
    });
}

// exports.saveOrder = function saveOrder(orderJSON) {
//     console.log("saving the order");
//     let Order = require('../../models/order.js');
//     let order = new Order();
//     order.set("shopifyID", orderJSON.id);
//     let address = orderJSON.address1 + " " + orderJSON.city + " " + orderJSON.province_code + " " + orderJSON.zip + " " + orderJSON.country;
//     order.set("shippingAddress", address);
//     order.set("customer", customer);

//     order.save(null, {
//         success: function(order) {
//             console.log("saved new order");
//         },
//         error: function(product, error) {
//             console.log('Failed to create new object, with error code: ' + error.message);
//         }
//     });
    
//     return order
// }

function saveLineItems(ordersJSON, orders) {
    var lineItems = [];

    for (var i = 0; i < ordersJSON.length; i++) {
        let orderJSON = ordersJSON[i];
        let order = order[i];

        if (order.get("shopifyID") == orderJSON.id) {
            let lineItemJSON = order.lineItem;
            let LineItem = require('../../models/lineItem.js');
            let lineItem = new LineItem();
            lineItem.set("shopifyID", lineItemJSON.id);
            lineItem.set("title", lineItemJSON.title);
            lineItem.set("variant_title", lineItemJSON.variant_title);
            lineItem.set("order", order);
            lineItems.push(lineItem);
        }
    }

    Parse.Object.saveAll(lineItem, {
        success: function (lineItems) {
            console.log(lineItems);                               
        },
        error: function (error) {                                     
            console.log(error);
        },
    });
}




//MARK: how I was saving a ton of data together, you can delete, jsut using for example
// let Customer = require('../../models/customer.js');
//     let customer = new Customer();

//     let firstName = "Timmy";
//     let lastName = "Testy";
//     customer.set("name", firstName + " " + lastName);
//     customer.set("email", "customerJSON.email");
//     customer.set("shopifyID", 0);

//     let Order = require('../../models/order.js');
//     let order = new Order();
//     order.set("shopifyID", 0);
//     order.set("customer", customer);

//     let LineItem = require('../../models/lineItem.js');
//     let lineItem = new LineItem();

//     let array = [lineItem, order, customer];

//     lineItem.set("order", order);
//     Parse.Object.saveAll(array, {
//         success: function (results) {
//             console.log(results);                         
//         },
//         error: function (error) {                                     
//             console.log(error);
//         },
//     });