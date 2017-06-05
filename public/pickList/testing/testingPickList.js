var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

// console.log(testingPickListCloud());
console.log(testingPickList());

function testingPickList() {
    let PickList = require("../pickList.js");
  PickList.createPickList().then(function(results) {
      console.log("yellow");
    //   console.log(Parse._encode(results))
      console.log(results)
  }, function(error) {
    console.log(error);
  });
}

function testingPickListCloud() {
    Parse.Cloud.run("getPickList").then(function(results) {
        
    }, function(error) {
        console.log(error);
    });
}

//creates test data to check for picking items
function createPickListTestData() {
    let objects = createNotPickOrder();
    let pickObjects = createPickOrder();

    Parse.Object.saveAll(objects);
    Parse.Object.saveAll(pickObjects);
}

//3 line items with nothing, inventory, then sewn (shouldn't be picked)
function createNotPickOrder() {
    let order = createOrder();
    let lineItem1 = createLineItem(1, order);
    let lineItem2 = createLineItem(2, order);
    let lineItem3 = createLineItem(3, order);

    let Inventory = require('../../models/inventory.js');
    let inventory = new Inventory();
    lineItem2.set("inventory", inventory);

    lineItem3.set("isPackaged", true);
    return [order, lineItem1, lineItem2, lineItem3];
}

//2 line items with inventory/sewn (should pick)
function createPickOrder() {
    let order = createOrder();
    let lineItem1 = createLineItem(1, order);
    let lineItem2 = createLineItem(2, order);
    
    let Inventory = require('../../models/inventory.js');
    let inventory = new Inventory();
    lineItem1.set("inventory", inventory);

    lineItem2.set("isPackaged", true);
    return [order, lineItem1, lineItem2];
}

function createOrder(id) {
    let Order = require('../../models/order.js');
    let order = new Order();
    order.set("shopifyID", id);
    order.set("note", "testing for creating pick list");
    //i.e. name = #HIPPIESANDHOUSEWIVEW1202<3
    order.set("name", "#HIPPIESANDHOUSEWIVEW" + id);
    order.set("shipmentStatus", "open");
    return order
}

function createLineItem(id, order) {
    let LineItem = require('../../models/lineItem.js');
    let lineItem = new LineItem();
    lineItem.set("shopifyLineItemID", id);
    lineItem.set("title", "Belle Bottom // Purple");
    lineItem.set("variant_title", "M");
    lineItem.set("order", order);
    lineItem.set("state", "open");
    lineItem.set("quantity", 1);
    lineItem.set("shopifyVariantID", id + 5);
    return lineItem
}