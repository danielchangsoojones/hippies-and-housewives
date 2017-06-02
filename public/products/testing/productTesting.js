var request = require('request');

//MARK: retrieving mass products
function getAllProducts(page) {
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/products.json';
    var parameters = {limit : 250, fields : "id,variants,title,vendor,options", page : page};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let products = JSON.parse(body).products;
            if (products.length != 0) {
                //we have not hit the most recent product because more exist beyond it
                getAllProducts(page + 1);
            }

            for (var i = 0; i < products.length; i++) {
                let productJSON = products[i];
                let ProductHelper = require("../js/getProducts.js");
                ProductHelper.uploadNewProduct(productJSON);
            }
        } else {
            console.log(error);
        }
    });
}