var Parse = require('parse/node');
var appId = "hippiesAndHousewives123SHDJ4852";
var masterKey = "hippiesAndHousewives485738FHDJSK";
var serverURL = "https://hippies-and-housewives.herokuapp.com/parse";
Parse.initialize(appId, masterKey);
Parse.masterKey = masterKey;
Parse.serverURL = serverURL;