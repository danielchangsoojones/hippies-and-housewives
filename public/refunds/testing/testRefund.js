require("../../resources/initializeParse.js");
var request = require('request');


getPracticeRefund();
function getPracticeRefund() {
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/orders/4859662665/refunds.json';
    var parameters = {};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let refunds = JSON.parse(body).refunds;
            let firstRefund = refunds[0];
            let Receive = require("../recieveRefund.js");
            Receive.recieveNewRefund(firstRefund);
        } else {
            console.log(error);
        }
    });
}