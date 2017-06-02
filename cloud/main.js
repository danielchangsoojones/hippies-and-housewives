Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define("searchProduct", function(req, res) {
  let searchText = req.params.searchText.toLowerCase();
  let Search = require("../public/inventory/search/searchProducts.js");
  Search.searchProductType(searchText).then(function(productTypes) {
    res.success(productTypes);
  }, function(error) {
    res.error(error);
  });
});

Parse.Cloud.beforeSave("ProductType", function(request, response) {
  let title = request.object.get("title");
  if (typeof title === 'string' || title instanceof String) {
    let lowercaseTitle = title.toLowerCase();
    request.object.set("lowercaseTitle", lowercaseTitle);
  }

  response.success();
});