const router = require("express").Router();
const Wallet = require('../models/Wallet');
const WalletTransactions = require('../models/WalletTransactions');
const VerifyToken = require("./verifyToken")

/******************** ADMIN USE */
router.get("/transactions/:id", async(req, res) => {
    try {
        const Wallets = await WalletTransactions.find({ "user": req.params.id }).collation({ locale: 'en', strength: 2 });
		const Aggre = await WalletTransactions.aggregate(
			[
			  {
				$group:
				   {
					 _id: "$type",
					 sum: { $sum: "$amount" }
				   }
			  }
			]
		 );
        res.status(200).json({total: Aggre, result: Wallets});
    } catch {
        res.status(500).json(err);
    }

});

router.get("/", async(req, res) => {
    try {
        const Wallets = await Wallet.find().populate("user",{ username: 1, email:1 });
        res.status(200).json(Wallets);
    } catch(err) {
        res.status(500).json(err);
    }

});

router.get("/walletID/:id", async(req, res) => {
    try {
		const Wallets = await Wallet.find({ "user": req.params.id }).collation({ locale: 'en', strength: 2 });
        res.status(200).json(Wallets);
    } catch(err) {
        res.status(500).json(err);
    }

});

/******************** */

/********************CLIENT USE */

router.post("/payment/history/:id", async(req, res) => {
	
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


router.post("/transactions/:id", async(req, res) => {
	
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

router.post("/balance/:id", async(req, res) => {
	
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


/************************* */

module.exports = router;