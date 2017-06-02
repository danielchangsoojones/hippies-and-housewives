Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.beforeSave("ProductType", function(request, response) {
  let title = request.object.get("title");
  if (typeof title === 'string' || title instanceof String) {
    let lowercaseTitle = title.toLowerCase();
    request.object.set("lowercaseTitle", lowercaseTitle);
  }

  response.success();
});