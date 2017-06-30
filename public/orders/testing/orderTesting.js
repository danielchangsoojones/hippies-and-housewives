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

function getPracticeOrder() {
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders/4979680009.json';
    var parameters = {};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let order = JSON.parse(body).order;
            let OrderHelper = require("../js/orders.js");
            OrderHelper.uploadNewOrder(order);
        } else {
            console.log(error);
        }
    });
}

practiceUpdateOrder();
function practiceUpdateOrder() {
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders/4979680009.json';
    var parameters = {};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let order = JSON.parse(body).order;
            let OrderHelper = require("../js/updateOrder.js");
            OrderHelper.updateOrder(order);
        } else {
            console.log(error);
        }
    });
}
