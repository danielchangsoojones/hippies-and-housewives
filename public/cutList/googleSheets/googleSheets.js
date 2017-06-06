var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var sheets = google.sheets('v4');
var Parse = require('parse/node');
var initializeParse = require("../../resources/initializeParse.js");

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

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
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken("4/NiR79nhhpy6vOHLp5wMmgwLVVe9sdJ6qOGSKXzibo5I", function(err, token) {
      if (err) {
        promise.reject(err);
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function createSheet(authClient) {
    var request = {
    // The spreadsheet to apply the updates to.
    spreadsheetId: '1e3JHbtMhLxuERXuUKqb39wTvJlqw_9eM40HaFcCasws',
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
    spreadsheetId: '1e3JHbtMhLxuERXuUKqb39wTvJlqw_9eM40HaFcCasws', 

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
   