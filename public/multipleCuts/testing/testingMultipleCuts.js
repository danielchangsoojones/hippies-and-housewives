require("../../resources/initializeParse.js");
var Parse = require('parse/node');

inputMultipleCuts();
function inputMultipleCuts() {
    let quantity = 5;
    let productTypeObjectID = "sW3DA7fqrH";
    let size = "M";
    let currentUser =  { __type: "Pointer", className:"_User", objectId: "odzCqVngRb"};
    let Input = require("../input/saveMultipleCuts.js");
    Input.saveMultipleCuts(productTypeObjectID, size, quantity, currentUser).then(function(item) {
        console.log(item);
    }, function(error) {
        console.log(error);
    });
}