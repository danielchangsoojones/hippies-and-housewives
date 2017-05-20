var request = require('request');
var Parse = require('parse/node');

function getAllOrders() {
    var shopifyURL = 'https://21dbd73540e6a727cfec5b701650e283:8e7ec897dbbf3f113968cad76e6e6f8d@apphappens.myshopify.com/admin/orders.json?limit=2';
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

    for (i = 0; i < orders.length; i++) {
        let Customer = require('../../models/order.js');
        let customer = new Customer();
        let order = orders[i];

        var customerJSON = order.customer;
        let firstName = customerJSON.first_name;
        let lastName = customerJSON.last_name;
        customer.set("name", firstName + " " + lastName);
        customer.set("email", customerJSON.email);
        customer.set("shopifyID", customerJSON.id);
        customers.push(customer);
    }

    Parse.Object.saveAll(customers, {
        success: function (list) {
            console.log(list);                                   
        },
        error: function (error) {
            // An error occurred while saving one of the objects.                                         
            console.log(error);
        },
    });
}

console.log(getAllOrders());