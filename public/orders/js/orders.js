var request = require('request');
var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

//MARK: saving a new order
exports.uploadNewOrder = function uploadNewOrder(orderJSON) {
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
    order.set("shipmentStatus", exports.getShipmentStatus(orderJSON));
    return order
}

function createLineItems(orderJSON, order, customer) {
    let lineItemsJSON = orderJSON.line_items;
    var lineItems = [];

    for (var i = 0; i < lineItemsJSON.length; i++) {
        let lineItemJSON = lineItemsJSON[i];
        
        let getVariant = require("../../products/variant/getVariant.js");
        getVariant.findProductVariant(lineItemJSON.variant_id, lineItemJSON.variant_title, lineItemJSON.title).then(function(variant) {
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
    lineItem.set("state", exports.getLineItemState(orderJSON, lineItemJSON.id));
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
exports.getShipmentStatus = function getShipmentStatus(orderJSON) {
    let fulfillments = orderJSON.fulfillments
    //statuses: open, label printed, in-transit, delivered or failure. See Shopify Fulfillment Event documentation for better understanding
    var shipmentStatus;

    if (fulfillments.length == 0 || fulfillments[0].shipment_status == null) {
        //the order has no shipment status yet because the shipping label has not been printed yet. Open means that the order is still in Hippies and Housewives possession.
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
exports.getLineItemState = function getLineItemState(orderJSON, shopifyLineItemID) {
    var state;

    if (orderJSON.closed_at != null) {
        state = "archived";
    } else if (orderJSON.cancelled_at != null) {
        state = "cancelled";
    } else if (orderJSON.financial_status == "refunded" || isLineItemRefunded(orderJSON, shopifyLineItemID)) {
        state = "refunded";
    } else {
        state = "open";
    }

    return state;
}

function isLineItemRefunded(orderJSON, shopifyLineItemID) {
    let refunds = orderJSON.refunds;
    let refundedLineItems = refunds.refund_line_items;
    if (refundedLineItems != undefined) {
        for (var i = 0; i < refundedLineItems.length; i++) {
        
            let refundLineItem = refundedLineItems[i];
        
            if (refundLineItem.line_item_id == shopifyLineItemID) {
                //this particular line item has been refunded
                return true;
            }
        }
    }
    
    return false;
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
                exports.uploadNewOrder(orders[i]);
            }

        } else {
            console.log(error);
        }
    });
}

console.log(getPracticeOrder());

function getPracticeOrder() {
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders/4918518729.json';
    var parameters = {};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let order = JSON.parse(body).order;
            exports.uploadNewOrder(order);

        } else {
            console.log(error);
        }
    });
}