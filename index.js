// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var bodyParser = require("body-parser");

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
console.log(process.env.HI);

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

//MARK: Order paths
var orderJS = require("./public/orders/js/orders.js");

app.post('/newOrder', function(req, res) {
  let newOrder = req.body;
  console.log("recieved new webhook order creation for:" + newOrder.id);
  orderJS.uploadNewOrder(newOrder);
  res.status(200).send('successfully recieved the new order');
});

app.post('/updateOrder', function(req, res) {
  let updatedOrder = req.body;
  console.log("recieved new webhook order updated for:" + updatedOrder.id);
  let Update = require("./public/orders/js/updateOrder.js");
  Update.updateOrder(updatedOrder);
  res.status(200).send('successfully recieved the updated order');
});

//MARK: product paths
app.post('/newProduct', function(req, res) {
  let newProduct = req.body;
  console.log("recieved new product creation from webhook for:" + newProduct.id);
  var productJS = require("./public/products/js/getProducts.js");
  productJS.uploadNewProduct(newProduct)

  res.status(200).send('successfully recieved the new product');
});

app.post('/updateProduct', function(req, res) {
  let updatedProduct = req.body;
  console.log("recieved new updated product from webhook for:" + updatedProduct.id);
  var Update = require("./public/products/js/updateProduct.js");
  Update.updateProduct(updatedProduct);

  res.status(200).send('successfully recieved the updated product');
});

//refund paths
app.post('/newRefund', function(req, res) {
  let refund = req.body;
  console.log("recieved new refund created from webhook for refund id:" + refund.id);
  var RefundHelper = require("./public/refunds/recieveRefund.js");
  RefundHelper.recieveNewRefund(refund);

  res.status(200).send('successfully recieved the created refund');
});


// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
