exports.saveMultipleCuts = function saveMultipleCuts(productTypeObjectID, size, quantity, currentUser) {
    var promise = new Parse.Promise();

    var Find = require("../../inventory/save/save.js");
    Find.getProductVariant(productTypeObjectID, size).then(function(productVariant) {
        return createItem(productVariant)
    }).then(function(item) {
        promise.resolve(item);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
}

function createItem(productVariant, currentUser) {
    var promise = new Parse.Promise();

    if (productVariant == undefined) {
        promise.reject(undefined);
    } else {
        let Item = require("../../models/item.js");
        let item = new Item();
        item.set("productVariant", productVariant);
        items.set("cut", createCut(item, currentUser));
        items.set("group", createGroup());
        item.save(null, {
            success: function(item) {
                promise.resolve(item);
            },
            error: function(error) {
                promise.reject(error);
            }
        });
    }

    return promise;
}

function createCut(item, currentUser) {
    let Cut = require("../../models/tracking/cut.js");
    let cut = new Cut();
    cut.set("user", currentUser);
    return cut;
}

function createGroup() {
    let Group = require("../../models/group.js");
    let group = new Group();
    return group;
}