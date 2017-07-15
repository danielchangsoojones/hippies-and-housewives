require("../../resources/initializeParse.js");
var Parse = require('parse/node');

function fetchPickList() {
  let PickList = require("../fetch/fetchPickList.js");
  PickList.fetchPickList().then(function(results) {
      console.log(results);
      console.log(results.length);
  }, function(error) {
    console.log(error);
  });
}

function testPickListUpdate() {
  let PickList = require("../pickList.js");
  PickList.updatePickList();
}

function removeDuplicatePickables() {
  const Pickable = require('../../models/pickable.js');
  let query = Pickable.query();
  query.limit(10000);
  query.include("order");
  query.find({
    success: function(pickables) {
      parseDuplicatePickables(pickables);
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function parseDuplicatePickables(pickables) {
  var alreadyUsedPickableIDs = [];
  for (var i = 0; i < pickables.length; i++) {
    let pickable = pickables[i];
    let order = pickable.get("order");
    if (alreadyUsedPickableIDs.indexOf(order.id) == -1) {
      //haven't seen this pickable yet
      alreadyUsedPickableIDs.push(order.id);
    } else {
      //duplicate pickable
      pickable.destroy();
    }
  }
}