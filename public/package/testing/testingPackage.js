require("../../resources/initializeParse.js");
var Parse = require('parse/node');

savePackage();
function savePackage() {
    let Save = require("../save/savePackage.js");
    let Package = require("../../models/tracking/package.js");
    let item = { __type: "Pointer", className:"Item", objectId: "sg2D01zMXT"};
    Save.savePackage(Package.states().in_inventory, item).then(function(item) {
        console.log(item);
    }, function(error) {
        console.log(error);
    });
}