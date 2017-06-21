exports.checkItemInitiation = function checkItemInitiation(item, currentUser) {
    let cut = item.get("cut");
    let sewn = item.get("sewn");
    let package = item.get("package");
    let initiate = item.get("initiate");

    if ((cut != undefined || sewn != undefined || package != undefined) && initiate == undefined) {
        let Initiate = require("../../models/tracking/initiate.js");
        let initiate = { __type:"Pointer", className: "Initiate"}
        console.log(initiate);
        // initiate.set("user", currentUser);
        item.set("initiate", initiate);
    }
}