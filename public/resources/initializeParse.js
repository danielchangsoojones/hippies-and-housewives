var Parse = require('parse/node');

//either production or development to point to the respective databases
var development = "development";
var production = "production";
var configuration = production;

var appId;
var masterKey;
var serverURL;

if (configuration == production) {
    appId = "hippiesAndHousewives123SHDJ4852";
    masterKey = "hippiesAndHousewives485738FHDJSK";
    serverURL = "https://hippies-and-housewives.herokuapp.com/parse";
} else if (configuration == development) {
    appId = "hippiesAndHousewivesDevelop489305028";
    masterKey = "hippiesAndHousewivesDevelop4850385933";
    serverURL = "https://hippies-and-housewives-develop.herokuapp.com/parse";
}


Parse.initialize(appId, masterKey);
Parse.masterKey = masterKey;
Parse.serverURL = serverURL;