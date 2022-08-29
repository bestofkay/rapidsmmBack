const router = require("express").Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');
const WalletTransactions = require('../models/WalletTransactions');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const dotenv = require("dotenv");
const axios = require('axios').default;
const qs = require('qs');
const crypto = require("crypto");
dotenv.config();
var coinbase = require('coinbase-commerce-node');
var Client = coinbase.Client;

let paymentCC = 1;

router.post("/coinbase/create/", async(req, res) => {
	let amount = req.body.amount;
	let tType='def';
	if(paymentCC % 20 == 0 && amount <= 200){Client.init(process.env.COINBASE_PAYOUT)} else{Client.init(process.env.COINBASE_CL); tType='not'};
	var Charge = coinbase.resources.Charge;
	var checkoutData = {
		'name': 'Rapid SMM Wallet Funding',
		'description': 'Rapid SMM Wallet Funding',
		'pricing_type': 'fixed_price',
		'local_price': {
			'amount': amount,
			'currency': 'USD'
		},
	};
	Charge.create(checkoutData, async function(error, response) {
		if (error) {
            return res.status(400).send({message: error.message});
        } else {
			const newPayment = new Payment({
				user: req.body._id,
				method: 'Coinbase',
				total_amount: amount,
				tType:tType,
				payment_status: 'Pending',
				reference: response.request_id
			})
			try {
				await newPayment.save();
				paymentCC++;
				return res.status(200).send(response);
			} catch (err) {
			}

          
        }
	});

});

router.get("/npr/create/", async(req, res) => {
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

router.post("/binance/create/", async(req, res) => {
	
	dispatch_request(
		'POST', 
		'/binancepay/openapi/v2/order',
		{
			"env" : {
			  "terminalType": "WEB"
			},
			"merchantTradeNo": req.body.merchantTradeNo,
			"orderAmount": req.body.amount,
			"currency": "BUSD",
			"goods" : {
			  "goodsType": "01",
			  "goodsCategory": "SMM",
			  "referenceGoodsId": req.body.referenceId,
			  "goodsName": "Rapid SMM Wallet Funding",
			  "goodsDetail": "Rapid SMM Wallet Funding"
			}
		  }
	  ).then(response => res.status(200).send(response)).catch(error => res.status(400).send(error));

});


function random_string() {
	return crypto.randomBytes(32).toString('hex').substring(0,32);
  }
  
  function dispatch_request(http_method, path, payload = {}) {
	  const timestamp = Date.now()
	  const nonce = random_string()
	  const payload_to_sign = timestamp + "\n" + nonce + "\n" + JSON.stringify(payload) + "\n"
	  const url = baseURL + path
	  const signature = hash_signature(payload_to_sign)
	  return axios.create({
		baseURL,
		headers: {
		  'content-type': 'application/json',
		  'BinancePay-Timestamp': timestamp,
		  'BinancePay-Nonce': nonce,
		  'BinancePay-Certificate-SN': process.env.BINANCEPAY_APIKEY,
		  'BinancePay-Signature': signature.toUpperCase()
		}
	  }).request({
		'method': http_method,
		url,
		data: payload
	  })
  }

module.exports = router;