var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var TOKEN_DIR = "./"
var TOKEN_PATH = TOKEN_DIR + "token.json";



function generateToken() {
    let GoogleSheet = require("../googleSheets.js");
    let secretJSON = require("../client_secret.json");
    let oauth2Client = GoogleSheet.getAuthClient(secretJSON);
    getNewToken(oauth2Client);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 */
function getNewToken(oauth2Client) {
  // If modifying these scopes, delete your previously saved credentials
  // at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
  //SCOPES are setting permissions like Read Only, Read And Write, ect.
  //This scope has access to every file in the google drive account. Maximum scope.
  var SCOPES = ['https://www.googleapis.com/auth/drive'];

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
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        promise.reject(err);
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      storeToken(token);
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