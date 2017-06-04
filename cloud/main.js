Parse.Cloud.define("searchProduct", function(req, res) {
  let searchText = req.params.searchText.toLowerCase();
  var ProductType = Parse.Object.extend("ProductType");
  var query = new Parse.Query(ProductType);
  query.startsWith("lowercaseTitle", searchText.toLowerCase());

//For some reason, if I put this query in another file and then make a promise for it, the return array to my iOS is not Parse encoded, so I can't cast it. But, if I do the query in this function, then it works fine.
  query.find({
      success: function(products) {
          res.success(products);
      },
      error: function(error) {
          res.error(error);
      }
  });
});

Parse.Cloud.define("saveInventory", function(req, res) {
  let productTypeObjectID = req.params.productTypeObjectID;
  let size = req.params.size;
  let quantity = req.params.quantity;

  let SaveInventory = require("../public/inventory/save/save.js");
  SaveInventory.saveInventory(productTypeObjectID, size, quantity).then(function(inventories) {
    res.success(inventories);
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("getPickList", function(req, res) {
  let PickList = require("../public/pickList/pickList.js");
  PickList.createPickList().then(function(results) {
    console.log(results);
    res.success(results);
  }, function(error) {
    res.error(error);
  });
});




//MARK: BEFORE SAVES
Parse.Cloud.beforeSave("ProductType", function(request, response) {
  let title = request.object.get("title");
  if (typeof title === 'string' || title instanceof String) {
    let lowercaseTitle = title.toLowerCase();
    request.object.set("lowercaseTitle", lowercaseTitle);
  }

  response.success();
});