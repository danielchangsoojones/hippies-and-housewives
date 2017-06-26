var Parse = require('parse/node');

exports.fetchPickList = function fetchPickList() {
    let Pickable = require("../../models/pickable.js");
    let query = Pickable.query();
    query.include("order");
    query.include("lineItems");
    return query.find();
}