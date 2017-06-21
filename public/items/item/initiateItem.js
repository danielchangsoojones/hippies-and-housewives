exports.checkItemInitiation = function checkItemInitiation(item, currentUser) {
    let cut = item.get("cut");
    let sewn = item.get("sewn");
    let package = item.get("package");

    if (cut != undefined || sewn != undefined || package != undefined) {
        let Initiate = require("../../models/tracking/initiate.js");
        let initiate = new Initiate();
        initiate.set("user", currentUser);
        item.set("initiate", initiate);
    }
}