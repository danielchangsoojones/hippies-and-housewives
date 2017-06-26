require("../../resources/initializeParse.js");
var Parse = require('parse/node');

testingPickList();
function testingPickList() {
  let PickList = require("../fetch/fetchPickList.js");
  PickList.fetchPickList().then(function(results) {
      console.log(results);
      console.log(results.length);
  }, function(error) {
    console.log(error);
  });
}