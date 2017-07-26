var Parse = require("parse/node");

exports.allocate = function allocate() {
    getInventoryAndLineItems().then(function(results) {
        allocateResults(results);
    }, function(error) {
        console.log(error);
    });
}

function getInventoryAndLineItems() {
    var promises = [];

    promises.push(getAllInventory());
    promises.push(getLineItems());

    return Parse.Promise.when(promises);
}

function getAllInventory() {
    const GetAllInventory = require('./getInventory/getAllInventory.js');
    return GetAllInventory.getAllInventory();
}

function getLineItems() {
    const LineItem = require('../models/lineItem.js');
    let query = LineItem.query();
    query.doesNotExist("pick");
    query.include("order");
    query.include("productVariant");
    query.include("item.lineItem");
    query.include("item.package");
    query.limit(10000);
    return query.find();
}

function allocateResults(results) {
    let items = results[0];
    let lineItems = results[1];
    let orderDictionary = groupLineItemsToOrders(lineItems);
    iterateThroughDictionary(orderDictionary, items);
    allocateLeftoverItems(items, lineItems);
}

function iterateThroughDictionary(orderDictionary, items) {
    for (var key in orderDictionary) {
        let lineItems = orderDictionary[key];

        if (lineItems == undefined) {
            break;
        } else {
            let itemsToAllocate = checkAllocationFor(lineItems, items);
            if (itemsToAllocate != undefined) {
                const ReplaceItem = require('./replace/replaceItem.js');
                ReplaceItem.replace(itemsToAllocate, lineItems, true);
            }
        }
    }
}

function checkAllocationFor(lineItems, items) {
    var itemsToAllocate = [];

    for(var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        
        /**
         * if the line item already has a packaged Item, then we don't want to replace it with a new item because then we will 
         * just have replaced the item and it create items with duplicate pointers to the same line item.
         */
        if (!checkIfLineItemIsAlreadyAllocated(lineItem)) {
            let matchingItem = findItemIndexMatching(lineItem.get("productVariant"), items);
            if (matchingItem == undefined) {
                //could not find matching item
                cleanDirtyItem(lineItem);
                return;
            } else {
                itemsToAllocate.push(matchingItem);
            }
        }
    }

    if (itemsToAllocate.length == 0) {
        //all line items were already allocated to completed items, so there is no need to save them, etc.
        return undefined;
    }

    removeAllocatedItemsFromTotalItemArray(items, itemsToAllocate);
    return itemsToAllocate;
}

/**
 * remove the items to allocate from the large array of items, so the next line item can not use
 * the same item that was taken.
 */
function removeAllocatedItemsFromTotalItemArray(items, itemsToAllocate) {
    for(var i = 0; i < itemsToAllocate.length; i++) {
        let itemToAllocate = itemsToAllocate[i];
        removeAllocatedItem(itemToAllocate, items);
    }
}

function removeAllocatedItem(itemToRemove, items) {
    let removingIndex = items.indexOf(itemToRemove);
    items.splice(removingIndex, 1);
}

function groupLineItemsToOrders(lineItems) {
    const PickList = require('../pickList/pickList.js');
    let orderDictionary = PickList.groupLineItemsToOrders(lineItems);
    return orderDictionary;
}

function findItemIndexMatching(lineItemProductVariant, items) {
    if (lineItemProductVariant != undefined) {
        for (var i = 0; i < items.length; i++) {
            let item = items[i];
            let itemProductVariant = item.get("productVariant");
            if (itemProductVariant != undefined && itemProductVariant.id == lineItemProductVariant.id) {
                return item;
            }
        }
    }

    return undefined;
}

/**
 * sometimes, the line item can be pointing to an item that is pointing to another line item because it got switched. 
 * This could happen if Daniel Jones manually changed something in the database. This basically just keeps the database clean 
 * from malpointing line items.
 */
function cleanDirtyItem(lineItem) {
    let item = lineItem.get("item");
    if (item != undefined) {
        let lineItemPointer = item.get("lineItem");
        if (lineItem.id != lineItemPointer.id) {
            lineItem.unset("item");
            lineItem.save();
        }
    }
}

function allocateLeftoverItems(items, lineItems) {
    var itemsToAllocate = [];
    var lineItemsToAllocate = [];
    var lineItemDictionary = {};

    for (var i = 0; i < lineItems.length; i++) {
        let lineItem = lineItems[i];
        let lineItemProductVariant = lineItem.get("productVariant");
        if (lineItemProductVariant != undefined && (itemOfLineItem == undefined || checkIfLineItemIsAlreadyAllocated(lineItem))) {
            //the line item has no packaged item, so it is fair game to allocate
            let matchingItem = findNonAllocatedItemIndexMatching(lineItemProductVariant, items);
            if (matchingItem != undefined) {
                //we found a leftover item to allocate to a non-100% pickable order
                removeAllocatedItem(matchingItem, items);
                itemsToAllocate.push(matchingItem);
                lineItemsToAllocate.push(lineItem);
            }
        }
    }

    const Replace = require('./replace/replaceItem.js');
    Replace.replace(itemsToAllocate, lineItemsToAllocate, false);
}

/**
 * for orders that are not 100% allocated, then we only want to allocate an item if it has no line item
 * if it already has a line item, then it's not fair to steal it because these non-100% are no more worthy
 * than its current line item.
 */
function findNonAllocatedItemIndexMatching(lineItemProductVariant, items) {
    if (lineItemProductVariant != undefined) {
        for (var i = 0; i < items.length; i++) {
            let item = items[i];
            let itemProductVariant = item.get("productVariant");
            if (itemProductVariant != undefined && itemProductVariant.id == lineItemProductVariant.id && item.get("lineItem") == undefined) {
                return item;
            }
        }
    }

    return undefined;
}

/**
 * a line item is already allocated if it's Item already has a package
 */
function checkIfLineItemIsAlreadyAllocated(lineItem) {
    let itemOfLineItem = lineItem.get("item");
    if (itemOfLineItem != undefined && itemOfLineItem.get("package") != undefined) {
        return true;
    }

    return false;
}