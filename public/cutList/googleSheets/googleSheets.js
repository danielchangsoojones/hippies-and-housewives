var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var sheets = google.sheets('v4');
var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");
//Our cut list is connected to the hippiesresources@gmail.com account for the Daniel Magic Cut List.
var spreadSheetID = "1kk8S8QUNUiIlYNBpQJ9O3L-ZXE-_BIVYjPmwqaIGmVw"

var lineItemsToCut = [];
var promise = new Parse.Promise();

exports.createCutList = function createCutList(lineItemsToCut) {
  console.log("sending to the google sheet");
  lineItems = lineItemsToCut;
  let secretJSON = require("./client_secret.json");
  authorize(secretJSON, createSheet);

  return promise;
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var oauth2Client = exports.getAuthClient();

  // Get previously stored token. Daniel Jones had to edit the normal Google Sheets Quickstart to just pull a saved token on our server since
  //We only need one token because we only access one google account. Normally you would save tokens to your database for each user.
  let token = require("../googleSheets/token/token.json");
  oauth2Client.credentials = token;
  callback(oauth2Client);
}

exports.getAuthClient = function getAuthClient(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  return oauth2Client;
}

function createSheet(authClient) {
    var request = {
    // The spreadsheet to apply the updates to.
    spreadsheetId: spreadSheetID,
    resource: {
      // A list of updates to apply to the spreadsheet.
      // Requests will be applied in the order they are specified.
      // If any request is not valid, no requests will be applied.
      requests: [
        {
            "addSheet": {
                "properties": {
                    "title": getDateTime(),
                    "index": 0
                }
            }
        },
      ], 
    },

    auth: authClient
  };

  sheets.spreadsheets.batchUpdate(request, function(err, response) {
    if (err) {
      promise.reject(err);
      return;
    }

    console.log(JSON.stringify(response, null, 2));
    var json = JSON.parse(JSON.stringify(response, null, 2));

    appendRows(authClient, response);
  });
}

function appendRows(authClient, response) {
  let sheetTitle = response.replies[0].addSheet.properties.title
  let lineItemRows = createLineItemRowValues();
  let numOfRows = lineItemRows.length;
   var request = {
    // The ID of the spreadsheet to update.
    spreadsheetId: spreadSheetID, 

    // The A1 notation of a range to search for a logical table of data.
    // Values will be appended after the last row of the table.
    range: sheetTitle +  "!A1:D" + numOfRows,

    // How the input data should be interpreted.
    valueInputOption: 'USER_ENTERED', 

    // How the input data should be inserted.
    insertDataOption: 'INSERT_ROWS', 

    resource: {
      // TODO: Add desired properties to the request body.
      "values": createLineItemRowValues()
    },

    auth: authClient
  };

  sheets.spreadsheets.values.append(request, function(err, response) {
    if (err) {
      promise.reject(err);
      return;
    }

    let success = true; 
    promise.resolve(success);
  });
}

function createLineItemRowValues() {
  let lineItemArray = [];

  //If you add/minus a column that you have to update the range to query because it will be off.
  let headerRow = ["Line Item ID", "Item Title", "Size", "Order ID"];
  lineItemArray.push(headerRow);

  for (var i = 0; i < lineItems.length; i++) {
    let lineItem = lineItems[i];
    let order = lineItem.get("order");
    let lineItemJSON = [lineItem.get("shopifyLineItemID"), lineItem.get("title"), lineItem.get("variant_title"), order.get("name")];
    lineItemArray.push(lineItemJSON);
  }

  return lineItemArray;
}


function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    //IF YOU USE SEMICOLONS IN THE SHEET TITLE, THEN IT DOESN'T PARSE THE RANGE CORRECTLY
    return "Date" + year + "-" + month + "-" + day + "Time" + hour + "-" + min + "-" + sec;
}
   