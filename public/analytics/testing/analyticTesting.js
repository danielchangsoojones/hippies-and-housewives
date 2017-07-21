require("../../resources/initializeParse.js");
var Parse = require('parse/node');

function getAnalyticsCounts() {
    let AnalyticCounts = require("../counts/analyticCounts.js");
    AnalyticCounts.getAnalyticCounts().then(function (count) {
        console.log(count);
    }, function(error) {
        console.log(error);
    });
}

function getOpenItemsSpreadsheet() {
    const LineItem = require('../../models/lineItem.js');
    let query = LineItem.query();

    const Item = require('../../models/item.js');
    let itemQuery = Item.query();
    itemQuery.doesNotExist("package");
    query.matchesQuery("item", itemQuery);

    let secondLineItemQuery = LineItem.query();
    secondLineItemQuery.doesNotExist("item");

    let orQuery = Parse.Query.or(secondLineItemQuery, query);

    orQuery.limit(10000);
    orQuery.include("order");
    orQuery.include("item");

    orQuery.find({
        success: function(lineItems) {
            const GoogleSheets = require('../../cutList/googleSheets/googleSheets.js');
            GoogleSheets.createCutList(lineItems);
        },
        error: function(error) {
            console.log(error);
        }
    });

}

function getItemsToSew() {
    const SewingAnalytics = require('../sewing/sewingAnalytics.js');
    SewingAnalytics.sendItemsToBeSewnToGoogleSheet();
}