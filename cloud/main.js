Parse.Cloud.define("searchProduct", function(req, res) {
  let searchText = req.params.searchText.toLowerCase();
  let Search = require("../public/products/search/searchProduct.js");
  Search.searchProduct(searchText).then(function(products) {
    res.success(products);
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("searchColor", function(req, res) {
  let searchText = req.params.searchText;
  let Search = require("../public/fabric/searchColor.js");
  Search.searchColor(searchText).then(function(fabrics) {
    res.success(fabrics);
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("saveInventory", function(req, res) {
  let productTypeObjectID = req.params.productTypeObjectID;
  let size = req.params.size;
  let quantity = req.params.quantity;

  let SaveInventory = require("../public/inventory/save/save.js");
  SaveInventory.saveInventory(productTypeObjectID, size, quantity).then(function(inventories) {
    console.log(inventories);
    let success = true;
    res.success(success);
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("getPickList", function(req, res) {
  let PickList = require("../public/pickList/fetch/fetchPickList.js");
  PickList.fetchPickList().then(function(pickables) {
    res.success(pickables);
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

Parse.Cloud.define("getOneColorCutList", function(req, res) {
  let color = req.params.color;
  let CutList = require("../public/cutList/oneColor/oneColorCutList.js");
  CutList.getOneColorCutList(color).then(function(success) {
    res.success(success);
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("archiveShopifyOrder", function(req, res) {
  let shopifyOrderID = req.params.shopifyOrderID;
  let Archive = require("../public/orders/archive/archiveOrder.js");
  Archive.archiveShopifyOrder(shopifyOrderID).then(function(success) {
    res.success(success);
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("inputMassCuts", function(req, res) {
  let productTypeObjectID = req.params.productTypeObjectID;
  let size = req.params.size;
  let quantity = req.params.quantity;

  let MassCuts = require("../public/multipleCuts/input/saveMultipleCuts.js");
  MassCuts.saveMultipleCuts(productTypeObjectID, size, quantity, req.user).then(function(item) {
    if (item == undefined) {
      res.error("item not created");
    } else {
      let success = true;
      res.success(success);
    }
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("inputPackage", function(req, res) {
  let uniqueItemID = req.params.uniqueItemID;

  var Save = require("../public/package/save/packageForm/saveInputtedPackage.js");
  Save.saveInputtedPackage(uniqueItemID).then(function(item) {
    var success = true;
    res.success(success);
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.define("getAnalyticCounts", function(req, res) {
  let AnalyticCounts = require("../public/analytics/counts/analyticCounts.js");
  AnalyticCounts.getAnalyticCounts().then(function(results) {
    res.success(results);
  }, function(error) {
    res.error(error);
  });
});

//MARK: Inventory
Parse.Cloud.define("updateInventoryCount", function(req, res) {
  let productVariantDictionary = req.params.variantDict;

  let Aggregate = require("../public/inventory/aggregate/aggregateInventory.js");
  Aggregate.updateInventoryCount(productVariantDictionary).then(function(results) {
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

Parse.Cloud.beforeSave("Item", function(request, response) {
  let uniqueID = request.object.get("uniqueID");

  if (uniqueID == undefined) {
    //the item doesn't have a unique id yet
    var Unique = require("../public/items/item/uniqueID.js");
    Unique.createUniqueID(request.object);
  }

  var Initiation = require("../public/items/item/initiateItem.js");
  Initiation.checkItemInitiation(request.object);

  response.success();
});

//MARK: after saves
Parse.Cloud.afterSave("LineItem", function(request, response) {
  var Initiation = require("../public/items/item/initiateItem.js");
  Initiation.checkLineItemInitiation(request.object);
  var RemovePickable = require("../public/items/item/removePickable.js");
  RemovePickable.checkPickables(request.object);

  response.success();
});