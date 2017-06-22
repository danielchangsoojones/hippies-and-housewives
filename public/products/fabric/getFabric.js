var Parse = require('parse/node');

//TODO: we want fabric to be a single pointer. Right now, fabric points all to an individual pointer, so we have multiple Innocence, etc.
exports.getFabric = function getFabric(productJSON) {
    var promise = new Parse.Promise();

    var Fabric = require('../../models/fabric.js');
    var query = Fabric.query();

    query.equalTo("color", exports.getColor(productJSON));

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
    fabric.set("color", exports.getColor(productJSON));
    return fabric;
}

//MARK: fabric attributes
exports.getColor = function getColor(productJSON) {
    var color;

    let title = productJSON.title;
    //Take a title like (Belle Bottoms // Hamptons), and return Hamptons as the color. We can't use the options right now because not all products have an options field with color. Some don't for some reason.
    let index = title.indexOf("/");
    if (index != -1) {
        color = title.substring(index + 3)
    } else {
        color = "COLOR ERROR";
    }

    return color.toLowerCase();
}