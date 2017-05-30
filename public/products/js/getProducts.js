var request = require('request');
var Parse = require('parse/node');

console.log(getAllProducts());

function getAllProducts(lastShopifyProductID) {
    let baseURL = require("../../resources/shopifyURL.js");
    var shopifyURL = baseURL + '/products.json';
    var parameters = {limit : 250, fields : "id,variants,title,vendor,options", since_id : lastShopifyProductID};
    request({url: shopifyURL, qs: parameters}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let products = JSON.parse(body).products;
            // console.log(products.length);
            if (products.length != 0) {
                //we have not hit the most recent order because more exist beyond it
                let lastShopifyProductID = products[products.length - 1].id;
                getAllProducts(lastShopifyProductID);
            }

            saveProducts(products);
        } else {
            console.log(error);
        }
    });
}

function saveProducts(products) {
    var productsArray = [];
    for (var i = 0; i < products.length; i++) {
        let Product = require('../../models/product.js');
        let product = new Product();
        var productJSON = products[i];

        product.set("shopifyID", productJSON.id);
        product.set("color", getColor(productJSON));

        productsArray.push(product);
    }

    // Parse.Object.saveAll(customers, {
    //     success: function (customers) {
    //         saveOrders(orders, orderDictionary);                               
    //     },
    //     error: function (error) {                                     
    //         console.log(error);
    //     },
    // });
}

function getColor(product) {
    var color;

    let title = product.title;
    //Take a title like (Belle Bottoms // Hamptons), and return Hamptons as the color. We can't use the options right now because not all products have an options field with color. Some don't for some reason.
    let index = title.indexOf("/");
    if (index != undefined) {
        color = title.substring(index + 3)
    } else {
        color = "COLOR ERROR";
    }

    console.log(color);
    return color;
}