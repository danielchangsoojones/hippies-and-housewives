var Parse = require('parse/node');

exports.checkItemInitiation = function checkItemInitiation(item) {
    let cut = item.get("cut");
    let sewn = item.get("sewn");
    let package = item.get("package");
    let isInitiated = item.get("isInitiated");

    if (cut != undefined || sewn != undefined || package != undefined) {
        item.set("isInitiated", true);
    }
}