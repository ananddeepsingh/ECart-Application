var express = require("express");
var app = express();
var request = require("request");
var http = require("http");
var jsonfile = require('jsonfile');
var file = './assets/cart.json';
var fs = require('fs');
var bodyParser = require('body-parser');
var cartPageData = [];


app.get("/", function (req, res) {
	fs.readFile('index.html', 'utf8', function (err, contents) {
		if (!err)
			res.send(contents);
		else
			res.send('error' + err);
	});
})

app.use(express.static('.'));
app.use(express.static('assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


var server = app.listen(5000, function () {
	var host = server.address().address,
		port = server.address().port;

	console.log('Magic is happening on port ' + port);
})


// Get Records From JSON FileUpload

app.get('/api/records', function (req, res) {

	jsonfile.readFile(file, function (err, obj) {
		obj.cartPageData = cartPageData;
		res.json(obj);
	})
})

app.get('/api/searchRecord/:id', function (req, res) {

	jsonfile.readFile(file, function (err, obj) {

		var actualObject = Object.keys(obj.productsInCart),
			objLen = actualObject.length;

		var rec;
		for (var i = 0; i < objLen; ++i) {
			var objs = obj.productsInCart[i];

			if (objs.p_id === req.params.id) {
				rec = objs;

				break;
			}
		}

		res.json(rec);
		res.status(200);
	})
});


// Get Merged Records JSON + Bought
app.post('/api/addToCartProduct', function (req, res) {

	var resJSON = req.body;

	if (cartPageData.length > 0) {

		var updatedQty = null;
		cartPageLen = cartPageData.length,
			foundObject = null;

		for (var i = 0; i < cartPageLen; i++) {
			console.log("Record entered in loop");

			if (cartPageData[i].id === req.body.id) {						// is product id same?

				if (cartPageData[i].p_size === req.body.p_size) {			// is product id + product size same?

					console.log("Same Record Found");
					foundObject = cartPageData[i];
					updatedQty = parseInt(req.body.p_quantity)
					//updatedQty = parseInt(cartPageData[i].p_quantity) + parseInt(req.body.p_quantity);
					cartPageData[i].p_quantity = updatedQty;

					res.json(cartPageData);

				}
				console.log("Record updated - 1st Time");
			}
		}

		if (!foundObject) {
			console.log("Record Added - 2nd Time");
			cartPageData.push(resJSON);
			// console.log(cartPageData);
			// res.status(200);
			res.json(cartPageData);
		}
	} else {

		console.log("Record Added - 1st Time");

		cartPageData.push(resJSON);

		res.json(cartPageData);
		console.log(cartPageData);

		res.end();
	}

	// console.log(cartPageData);
	// res.status(200);
	// res.json(cartPageData);
	// res.end();
})



// CART Page
app.get('/api/cartPage', function (req, res) {
	console.log(cartPageData);
	res.json(cartPageData)
	res.status(200);
	// res.end();
})