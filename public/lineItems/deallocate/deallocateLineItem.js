/**
 * If a line item is cancelled, refunded, or archived without the lineItem having a shipped property
 * theb, this means that the line item's current item (if it even exists) was never used, and therefore,
 * it should be reallocated to a new line item that can use it.
 */
exports.deallocateNonUsedItem = function deallocateNonUsedItem(lineItem) {
    let ship = lineItem.get("ship");
    let item = lineItem.get("item");
    let state = lineItem.get("state");
    console.log(ship);
    console.log(item);
    console.log("state");
}