require("../../resources/initializeParse.js");
var Parse = require('parse/node');

searchFabric("Fire Engine");
function searchFabric(searchText) {
    var Search = require("../searchColor.js");
    Search.searchColor(searchText).then(function(fabrics) {
        console.log(fabrics);
    }, function(error) {
        console.log(error);
    });
}