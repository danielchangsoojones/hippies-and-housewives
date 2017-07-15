var Parse = require('parse/node');

exports.setPackage = function setPackage(item, state) {
    exports.setItemAsPackaged(item, state);
    return item.save();
}

exports.setItemAsPackaged = function setItemAsPackaged(item, state) {
    let Package = require("../../models/tracking/package.js");
    var package = new Package();
    package.set("state", state);
    item.set("package", package);
}

