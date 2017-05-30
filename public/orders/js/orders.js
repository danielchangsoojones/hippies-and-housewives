var request = require('request');
var Parse = require('parse/node');

function getMostRecentlySavedOrder() {
    
}

function getAllOrders() {
    var shopifyURL = 'https://21dbd73540e6a727cfec5b701650e283:8e7ec897dbbf3f113968cad76e6e6f8d@apphappens.myshopify.com/admin/orders.json?limit=2';
    var parameters = {limit : 250, since_id : }
    request(shopifyURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let orders = JSON.parse(body).orders;
            saveCustomers(orders);
        }
    });
}

function saveCustomers(orders) {
    var customers = [];
    //Creating order dictionary, so when we get the customers back after saving, then we can easily see which order the customer corresponds to when saving orders.
    var orderDictionary = {};

    for (i = 0; i < orders.length; i++) {
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

    for (i = 0; i < ordersJSON.length; i++) {
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

function saveLineItems(ordersJSON, orders) {
    var lineItems = [];

    for (i = 0; i < ordersJSON.length; i++) {
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

console.log(getAllOrders());