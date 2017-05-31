var request = require('request');
var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

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

exports.saveOrder = function saveOrder(orderJSON) {
    console.log("saving the order");
    let Order = require('../../models/order.js');
    let order = new Order();
    order.set("shopifyID", orderJSON.id);
    let address = orderJSON.address1 + " " + orderJSON.city + " " + orderJSON.province_code + " " + orderJSON.zip + " " + orderJSON.country;
    order.set("shippingAddress", address);
    order.set("customer", customer);

    order.save(null, {
        success: function(order) {
            console.log("saved new order");
        },
        error: function(product, error) {
            console.log('Failed to create new object, with error code: ' + error.message);
        }
    });
    
    return order
}

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