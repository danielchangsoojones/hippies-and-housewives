var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

exports.getFabric = function getFabric(productJSON) {
    var promise = new Parse.Promise();

    var Fabric = Parse.Object.extend("Fabric");
    var query = new Parse.Query(Fabric);

    query.equalTo("color", getColor(productJSON));

    query.first({
        success: function(fabric) {
            if (fabric == undefined) {
                //fabric color does not exist yet, so save it
                let newFabric = createNewFabric(productJSON);
                promise.resolve(newFabric);
            } else {
                //fabric already exists
                promise.resolve(fabric);
            }
        },
        error: function(error) {
            promise.reject(error);
        }
    });

    return promise;
}

function createNewFabric(productJSON) {
    let Fabric = require('../../models/fabric.js');
    let fabric = new Fabric();
    fabric.set("color", getColor(productJSON));
    return fabric;
}

//MARK: fabric attributes
function getColor(product) {
    var color;

    let title = product.title;
    //Take a title like (Belle Bottoms // Hamptons), and return Hamptons as the color. We can't use the options right now because not all products have an options field with color. Some don't for some reason.
    let index = title.indexOf("/");
    if (index != undefined) {
        color = title.substring(index + 3)
    } else {
        color = "COLOR ERROR";
    }

    return color.toLowerCase();
}