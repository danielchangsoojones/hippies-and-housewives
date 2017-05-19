var request = require('request');

function getAllOrders() {
    var url = 'https://21dbd73540e6a727cfec5b701650e283:8e7ec897dbbf3f113968cad76e6e6f8d@apphappens.myshopify.com/admin/orders.json?limit=2';
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //For some reason, the json has a field orders which you have to access first before it gets to the array of orders
            let orders = JSON.parse(body).orders;
            
            for (i = 0; i < orders.length; i++) { 
                let order = orders[i];
                console.log(order.id);
            }
        }
    })
}

console.log(getAllOrders());

