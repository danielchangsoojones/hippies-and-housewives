exports.sendItemsToBeSewnToGoogleSheet = function sendItemsToBeSewnToGoogleSheet() {
    let query = exports.createItemsToBeSewnQuery();
    query.find({
        success: function(lineItems) {
            const GoogleSheets = require('../../cutList/googleSheets/googleSheets.js');
            GoogleSheets.createCutList(lineItems);
        },
        error: function(error) {
            console.log(error);
        }   
    });
}

exports.createItemsToBeSewnQuery = function createItemsToBeSewnQuery() {
    const LineItem = require('../../models/lineItem.js');
    let query = LineItem.query();

    const Item = require('../../models/item.js');
    let itemQuery = Item.query();
    itemQuery.exists("cut");
    itemQuery.doesNotExist("package");
    query.matchesQuery("item", itemQuery);
    
    query.limit(10000);
    return query;
}