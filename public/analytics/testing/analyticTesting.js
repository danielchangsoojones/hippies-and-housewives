require("../../resources/initializeParse.js");

getAnalyticsCounts()
function getAnalyticsCounts() {
    let AnalyticCounts = require("../counts/analyticCounts.js");
    AnalyticCounts.getAnalyticCounts().then(function (count) {
        console.log(count);
    }, function(error) {
        console.log(error);
    });
}