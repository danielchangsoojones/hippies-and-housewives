var Parse = require('parse/node');

exports.checkItemInitiation = function checkItemInitiation(item, currentUser) {
    let cut = item.get("cut");
    let sewn = item.get("sewn");
    let package = item.get("package");
    let initiate = item.get("initiate");

    if ((cut != undefined || sewn != undefined || package != undefined) && initiate == undefined) {
        let Initiate = require("../../models/tracking/initiate.js");
        let initiate = new Initiate();
        let hi = {"__type":"Pointer","className":"Initiate", "objectId": "fjksidkfil"}
        console.log("heyyyy")
        console.log(initiate);
        console.log(Parse._encode(hi));
        item.set("initiate", hi);
    }
}