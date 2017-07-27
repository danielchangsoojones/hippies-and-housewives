var Parse = require("parse/node");

exports.cleanEmptyLineItemProductVariants = function cleanEmptyLineItemProductVariants() {
    findEmptyProductVariantLineItems().then(function(lineItems) {
        iterateThrough(lineItems);
    }, function(error) {
        console.log(error);
    });
}

function findEmptyProductVariantLineItems() {
    const LineItem = require('../../models/lineItem.js');
    let query = LineItem.query();
    query.doesNotExist("productVariant");
    query.include("item");
    return query.find();
}

function iterateThrough(lineItems) {
    for (var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        setProductVariantToLineItem(lineItem);
    }
}

function setProductVariantToLineItem(lineItem) {
    const GetVariant = require('../../products/variant/getVariant.js');
    GetVariant.findProductVariant(lineItem.get("shopifyVariantID"), lineItem.get("variant_title"), lineItem.get("title")).then(function(productVariant) {
        if (productVariant == undefined) {
            var promise = new Parse.Promise();
            return promise.reject("the product variant was still not found. Please check why the Line Item data could be wrong");
        } else {
            lineItem.set("productVariant", productVariant);
            let objects = removeItemOfLineItem(lineItem);
            const SaveAll = require('../../helpers/save/saveAll.js');
            return SaveAll.save(objects);
        }
    }).then(function(objects) {
        console.log(objects);
    }, function(error) {
        console.log(error);
    });
}

function removeItemOfLineItem(lineItem) {
    let item = lineItem.get("item");
    if (item != undefined) {
        item.set("isDeleted", true);
        lineItem.unset("item");
    }
    
    return [lineItem, item];
}

