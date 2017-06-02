function makeTestInventory(searchText, size) {
    let Search = require("../search/searchProducts.js");
    Search.searchProducts(searchText, size).then(function(products) {
        var InventoryHelper = require("../getInventory.js");
        InventoryHelper.recieveInventory(products[0]);
    }, function(error) {
        console.log(error);
    });
}

console.log(makeTestInventory("Beauty Bandeau Top", "L"));