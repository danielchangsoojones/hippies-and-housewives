require("../../resources/initializeParse.js");
var Parse = require('parse/node');

savePackage();
function savePackage() {
    var SavingPackage = require("../save/packageForm/saveInputtedPackage.js");
    SavingPackage.saveInputtedPackage(8269868415).then(function (item) {
        console.log(item);
    }, function (error) {
        console.log(error);
    });
}