require("../../resources/initializeParse.js");
var Parse = require('parse/node');

inputMultipleCuts();
function inputMultipleCuts() {
    let quantity = 5;
    let productTypeObjectID = "xDrFQ8cVIv";
    let size = "XS";
    let currentUser =  { __type: "Pointer", className:"_User", objectId: "odzCqVngRb"};
    let Input = require("../input/saveMultipleCuts.js");
    Input.saveMultipleCuts(productTypeObjectID, size, quantity, currentUser).then(function(item) {
        console.log(item);
    }, function(error) {
        console.log(error);
    });
}