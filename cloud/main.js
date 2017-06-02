Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define("searchProduct", function(req, res) {
  let searchText = req.params.searchText.toLowerCase();
  let Search = require("../public/inventory/search/searchProducts.js");
  Search.searchProductType(searchText).then(function(productTypes) {
    console.log(productTypes);
    console.log(productTypes.toJSON());
    res.success(productTypes.toJSON());
  }, function(error) {
    res.error(error);
  });

  // var ProductType = Parse.Object.extend("ProductType");
  // var query = new Parse.Query(ProductType);
  //   query.startsWith("lowercaseTitle", searchText.toLowerCase());

  //   query.find({
  //       success: function(products) {
  //           res.success(products);
  //       },
  //       error: function(error) {
  //           res.error(error);
  //       }
  //   });
});

Parse.Cloud.beforeSave("ProductType", function(request, response) {
  let title = request.object.get("title");
  if (typeof title === 'string' || title instanceof String) {
    let lowercaseTitle = title.toLowerCase();
    request.object.set("lowercaseTitle", lowercaseTitle);
  }

  response.success();
});