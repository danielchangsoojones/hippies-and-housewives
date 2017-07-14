exports.replace = function replace(itemsToAllocate, newLineItems) {
    let oldLineItemsToSave = [];
    let updatedItemsToSave = [];
    let newLineItemsToSave = [];

    for (var i = 0; i < itemsToAllocate.length; i++) {
        let item = itemsToAllocate[i];
        let oldLineItem = item.get("lineItem");
        let newLineItem = findMatchingLineItem(newLineItems, item.get("productVariant"));
        if (oldLineItem != undefined) {
            if (newLineItem != undefined && newLineItem.id != oldLineItem.id) {
                //we don't want to unset a line item if it was the exact same line item
                oldLineItem.unset("item");
                oldLineItemsToSave.push(oldLineItem);
            }
        }
        if (newLineItem != undefined) {
            item.set("lineItem", newLineItem);
            newLineItem.set("item", item);
            updatedItemsToSave.push(item);
            newLineItemsToSave.push(newLineItem);
        }
    }

    createPickable(newLineItems);
    const SaveAll = require('../../orders/js/orders.js');
    SaveAll.saveAllComponents([updatedItemsToSave, newLineItemsToSave, oldLineItemsToSave]);   
}

function findMatchingLineItem(newLineItems, itemProductVariant) {
    if (itemProductVariant != undefined) {
        for (var i = 0; i < newLineItems.length; i++) {
            let lineItem = newLineItems[i];
            let lineItemProductVariant = lineItem.get("productVariant");
            if (lineItemProductVariant != undefined && lineItemProductVariant.id == itemProductVariant.id) {
                return lineItem;
            }
        }
    }

    return undefined;
}

function createPickable(lineItems) {
    const PickList = require('../../pickList/pickList.js');
    PickList.savePickable(lineItems);
}