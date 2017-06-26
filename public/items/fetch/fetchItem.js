exports.fetchItem(uniqueID) = function fetchItem(uniqueID) {
    let Item = require("../../models/item.js");
    let query = Item.query();
    query.equalTo("uniqueID", uniqueID);
    return query.first();
}