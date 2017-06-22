var Parse = require('parse/node');

exports.searchColor = function searchColor(searchText) {
    var promise = new Parse.Promise();

    var Fabric = require("../models/fabric.js");
    var query = Fabric.query();
    query.startsWith("color", searchText.toLowerCase());

    //For some reason, if I put this query in another file and then make a promise for it, the return array to my iOS is not Parse encoded, so I can't cast it. But, if I do the query in this function, then it works fine.
    query.find({
      success: function(fabrics) {
          let uniqueFabrics = removeDuplicates(fabrics);
          promise.resolve(Parse._encode(uniqueFabrics));
      },
      error: function(error) {
          promise.reject(error);
      }
    });

    return promise;
}

function removeDuplicates(fabrics) {
    var alreadyUsedColors = [];
    var uniqueFabrics = [];

    for (var i = 0; i < fabrics.length; i++) {
        let fabric = fabrics[i];
        let color = fabric.get("color");
        if (alreadyUsedColors.indexOf(color) == -1) {
            //haven't seen this color yet
            alreadyUsedColors.push(color);
            uniqueFabrics.push(fabric);
        }
    }

    return uniqueFabrics;
}



