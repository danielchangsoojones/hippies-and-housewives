var Parse = require('parse/node');

exports.checkItemInitiation = function checkItemInitiation(item) {
    let cut = item.get("cut");
    let sewn = item.get("sewn");
    let package = item.get("package");

    if (cut != undefined || sewn != undefined || package != undefined) {
        //I can't figure out how to save a pointer correctly in a Parse Before Save function.
        //It saves, but when it is recieved in my database, it is not encoded correcly or something because it just saves as text, not a pointer
        //So, I just created a bool instead because that works
        item.set("isInitiated", true);
    }
}

exports.checkLineItemInitiation = function checkLineItemInitiation(lineItem) {
    let pick = lineItem.get("pick");
    let ship = lineItem.get("ship");
    let item = lineItem.get("item");

    if ((pick != undefined || ship != undefined) && item != undefined) {
        item.set("isInitiated", true);
        item.save();
    }
}