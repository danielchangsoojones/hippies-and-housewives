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
    res.success(results);
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("createCutList", function(req, res) {
  let CutList = require("../public/cutList/cutList.js");
  CutList.getCutList().then(function(results) {
    res.success("success");
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("tryLineItemsArchive", function(req, res) {
  let orderID = req.params.orderID;
  let Archive = require("../public/orders/archive/archiveOrder.js");
  Archive.checkIfOrderShouldArchive(orderID).then(function(lineItems) {
    res.success("success");
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("removeInventory", function(req, res) {
  let productTypeObjectID = req.params.productTypeObjectID;
  let size = req.params.size;
  let Inventory = require("../public/inventory/remove/removeInventory.js");
  Inventory.removeInventory(productTypeObjectID, size).then(function(inventory) {
    res.success(inventory);
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

Parse.Cloud.beforeSave("LineItem", function(request, response) {
  let isCut = request.object.get("isCut");
  let isSewn = request.object.get("isSewn");
  let isPackaged = request.object.get("isPackaged");
  let isPicked = request.object.get("isPicked");
  let isShipped = request.object.get("isShipped");

  if (isCut || isSewn || isPackaged || isPicked || isShipped) {
    //if it has been marked through the process, then make sure to set the item as initiated
    request.object.set("isInitiated", true);
  }

  response.success();
});