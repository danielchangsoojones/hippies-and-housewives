require("../resources/initializeParse.js");
var Parse = require('parse/node');
let LineItem = require("../models/LineItem.js");
let Item = require("../models/Item.js");

getNumberOfCuts();
function getNumberOfCuts() {
    let CutList = require("../cutList/cutList.js");
    let query = CutList.createLineItemsToCutQuery();
    query.limit(10000);
    query.count({
        success: function(count) {
            console.log(count);
        }, 
        error: function(error) {
            console.log(error);
        }
    });
}

// getGroupCuts()
function getGroupCuts() {
    let query = LineItem.query();
    
    var itemQuery = Item.query();
    itemQuery.exists("group");
    query.matchesQuery("item", itemQuery);

    query.limit(10000);
    query.count({
        success: function(count) {
            console.log(count);
        },
        error: function(error) {
            console.log(error);
        }
    });
}

// getNoItem();
// function getNoItem() {
//     let query = LineItem.query();
//     query.limit(10000);
//     query.notEqualTo("isInitiated", true);
//     query.doesNotExist("inventory");
//     query.count({
//         success: function(count) {
//             console.log(count)
//         },
//         error: function(error) {
//             console.log(error);
//         }
//     })
// }
