exports.cleanItems = function cleanItems() {
    getAllItems().then(function(items) {
        iterateThrough(items);
    }, function(error) {
        console.log(error);
    });
}

function getAllItems() {
    const Item = require('../../models/item.js');
    let query = Item.query();
    query.exists("lineItem");
    query.include("lineItem.item");
    query.limit(20000);
    return query.find();
}

function iterateThrough(items) {
    //{Line Item ID : [Item]}
    let duplicateItemDictionary = {};

    for (var i = 0; i < items.length; i++) {
        let item = items[i];
        let lineItem = item.get("lineItem");
        
        if (lineItem != undefined) {
            let dictionaryElement = duplicateItemDictionary[lineItem.id];
            let haveNotSeenThisLineItemIDYet = dictionaryElement == undefined;
            if (haveNotSeenThisLineItemIDYet) {
                duplicateItemDictionary[lineItem.id] = [item];
            } else {
                //we have seen another item with the same line item before, so it is a duplicate
                duplicateItemDictionary[lineItem.id].push(item);
            }
        } 
    }

    iterateThroughDictionary(duplicateItemDictionary);
}

function iterateThroughDictionary(duplicateItemDictionary) {
    var allItemsToClean = [];

    for (var lineItemID in duplicateItemDictionary) {
        let items = duplicateItemDictionary[lineItemID];
        let thereAreDuplicateItems = items.length > 1
        if (thereAreDuplicateItems) {
            let itemsToClean = clean(items, lineItemID);
            allItemsToClean.push(itemsToClean);
        }
    }

    save(allItemsToClean);
}

function clean(items, lineItemID) {
    var itemsToClean = [];

    for (var i = 0; i < items.length; i++) {
        let item = items[i];
        let lineItem = item.get("lineItem");
        if (lineItem != undefined) {
            let itemOfLineItem = lineItem.get("item");
            if (itemOfLineItem == undefined || item.id != itemOfLineItem.id) {
                //the item is pointing to a Line Item, but the LineItem is not pointing back
                item.unset("lineItem");
                itemsToClean.push(item);
            }
        }
    }

    return itemsToClean;
}

function save(itemsToClean) {
    const SaveAll = require('../../helpers/save/saveAll.js');
    SaveAll.save(itemsToClean).then(function(results) {
        console.log(results);
    }, function(error) {
        console.log(error);
    });
}