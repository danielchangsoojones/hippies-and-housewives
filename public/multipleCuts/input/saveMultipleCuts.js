var Parse = require('parse/node');

exports.saveMultipleCuts = function saveMultipleCuts(productTypeObjectID, size, quantity, currentUser) {
    var promises = [];

    for (var i = 0; i < quantity; i++) {
        let promise = new Parse.Promise();

        getProductVariant(productTypeObjectID, size, i).then(function (result) {
            let productVariant = result.productVariant;
            let position = result.i;
            return createItem(productVariant, currentUser, position);
        }).then(function (item) {
            promise.resolve(item);
        }, function (error) {
            promise.reject(error);
        });

        promises.push(promise);
    }

    return Parse.Promise.when(promises);
}

function createItem(productVariant, currentUser, position) {
    var promise = new Parse.Promise();

    if (productVariant == undefined) {
        promise.reject(undefined);
    } else {
        let Item = require("../../models/item.js");
        let item = new Item();
        item.set("productVariant", productVariant);
        item.set("cut", createCut(item, currentUser));
        item.set("group", createGroup());
        var Allocate = require("../../items/allocate/allocateItem.js");
        Allocate.allocateItem(item, position).then(function(objects) {
            let SaveAll = require("../../orders/js/orders.js");
            return SaveAll.saveAllComponents(objects)
        }).then(function(results) {
                promise.resolve(results);
            }, function(error) {
                promise.reject(error);
        });
    }

    return promise;
}

function createCut(item, currentUser) {
    let Cut = require("../../models/tracking/cut.js");
    let cut = new Cut();
    //For some reason, user can't be an object, it must be a pointer
    let pointerUser = { __type: "Pointer", className:"_User", objectId: currentUser.id};
    cut.set("user", pointerUser);
    return cut;
}

function createGroup() {
    let Group = require("../../models/group.js");
    let group = new Group();
    return group;
}

function getProductVariant(productTypeObjectID, size, position) {
    var promise = new Parse.Promise();

    var Find = require("../../inventory/save/save.js");
    Find.getProductVariant(productTypeObjectID, size, position).then(function (result) {
        promise.resolve(result);
    }, function (error) {
        promise.reject(error);
    });

    return promise;
}