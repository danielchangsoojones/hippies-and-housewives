var Parse = require('parse/node');
let LineItem = require('../../models/lineItem.js');

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
    order.set("shippingAddress", exports.createAddress(orderJSON));
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
            let Allocate = require("../allocate/allocateLineItem.js");
            Allocate.allocateLineItem(variant, lineItem).then(function(objects) { 
                exports.saveAllComponents([order, customer, objects]);
            }, function (error) {
                console.log(error);
            });
        }, function(error) {
            console.log("couldn't find the variant");
            console.log(error);
        })
    }
}

function createLineItem(lineItemJSON, order, orderJSON) {
    let lineItem = new LineItem();
    lineItem.set("shopifyLineItemID", lineItemJSON.id);
    lineItem.set("title", lineItemJSON.title);
    lineItem.set("variant_title", lineItemJSON.variant_title);
    lineItem.set("order", order);
    lineItem.set("state", exports.getLineItemState(orderJSON, lineItemJSON.id));
    lineItem.set("quantity", lineItemJSON.quantity);
    lineItem.set("shopifyVariantID", lineItemJSON.variant_id);
    return lineItem
}

exports.saveAllComponents = function saveAllComponents(objects) {
    var promise = new Parse.Promise();

    var arr = objects;
    if (!Array.isArray(objects)) {
        arr = [objects];
    }

    var flattenedObjects = [].concat.apply([], arr);

    Parse.Object.saveAll(flattenedObjects, {
        success: function (results) {
            promise.resolve(results);
        },
        error: function (error) {                                
            promise.reject(error);
        },
    });

    return promise;
}

//MARK: getting order attributes
exports.getShipmentStatus = function getShipmentStatus(orderJSON) {
    let fulfillments = orderJSON.fulfillments
    //statuses: open, label printed, internal shipping bin, in-transit, delivered or failure. See Shopify Fulfillment Event documentation for better understanding
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

    if (isLineItemRefunded(orderJSON, shopifyLineItemID)) {
        state = "refunded";
    } else if (orderJSON.cancelled_at != null) {
        state = "cancelled";
    } else if (orderJSON.closed_at != null) {
        state = "archived";
    } else {
        state = "open";
    }

    return state;
}

function isLineItemRefunded(orderJSON, shopifyLineItemID) {
    let refunds = orderJSON.refunds;

    for (var j = 0; j < refunds.length; j++) {
        let refund = refunds[j];
        let refundedLineItems = refund.refund_line_items;
        let RefundHelper = require("../../refunds/recieveRefund.js");
        let refundLineItemIDs = RefundHelper.getLineItemIDsFromRefund(refund);

        if (refundLineItemIDs.indexOf(shopifyLineItemID) != -1) {
            //this particular line item exists in the refund line items array, therefore, it was refunded
            return true;
        }
    }

    return false;
}

exports.createAddress = function createAddress(orderJSON) {
    let Address = require('../../models/address.js');
    let address = new Address();
    
    return exports.setAddress(address, orderJSON);
}

exports.setAddress = function setAddress(address, orderJSON) {
    let addressJSON = orderJSON.shipping_address;
    address.set("firstName", addressJSON.first_name);
    address.set("lastName", addressJSON.last_name);
    address.set("phone", addressJSON.phone);
    address.set("addressOne", addressJSON.address1);
    address.set("addressTwo", addressJSON.address2);
    address.set("city", addressJSON.city);
    address.set("state", addressJSON.province);
    address.set("zip", addressJSON.zip);
    address.set("country", addressJSON.country);
    
    return address;
}