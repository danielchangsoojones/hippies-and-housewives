require("../../resources/initializeParse.js");
var Parse = require('parse/node');

savePackage();
function savePackage() {
    var SavingPackage = require("../save/savePackage.js");
    let Package = require("../../models/tracking/package.js");

    let Item = require("../../models/item.js");
    let query = Item.query();
    query.equalTo("objectId", "fWHMhGkvS2");
    query.first({
        success: function(item) {
            SavingPackage.savePackage(Package.states().in_inventory, item).then(function (item) {
                console.log(item);
            }, function (error) {
                console.log(error);
            });
        }
    });
}