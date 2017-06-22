require("../../resources/initializeParse.js");
var Parse = require('parse/node');

testingPickList();
function testingPickList() {
  let PickList = require("../pickList.js");
  PickList.createPickList().then(function(results) {
      console.log(results)
  }, function(error) {
    console.log(error);
  });
}