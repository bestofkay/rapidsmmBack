const router = require("express").Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const dotenv = require("dotenv");
const axios = require('axios').default;
const qs = require('qs');
const crypto = require("crypto");
dotenv.config();
var coinbase = require('coinbase-commerce-node');
var Client = coinbase.Client;

Client.init(process.env.COINBASE_PAYOUT);

let accessToken = "";
let refreshToken = "";

/*const binancePay = () => {

	try {
		const body = {
			name: req.body.title,
			description: 'RapidSMM',
			requested_info: 'Customer Email',
			pricing_type: 'fixed_price',
			local_price: 'Price in local fiat currency'
		}
        const response = await axios.post('https://api.commerce.coinbase.com/checkouts/', body, {
            headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-CC-Api-Key': process.env.COINBASE_PAYOUT
            }
        });
        console.log(response.data);

    } catch (e) {
        res.status(500).json(e);
    }

}*/



router.get("/retrieve/", async(req, res) => {
	
	var Charge = coinbase.resources.Charge;

	Charge.retrieve('H34J7CVX', function (error, response) {
		console.log(error);
		console.log(response);
	  });
	  
});


router.get("/create/", async(req, res) => {
	var Charge = coinbase.resources.Charge;
	var checkoutData = {
		'name': 'The Sovereign Individual',
		'description': 'Mastering the Transition to the Information Age',
		'pricing_type': 'fixed_price',
		'local_price': {
			'amount': '100.00',
			'currency': 'USD'
		},
		'requested_info': ['name', 'email']
	};
	Charge.create(checkoutData, function (error, response) {
	  console.log(error);
	  console.log(response);
	});

});

module.exports = router;