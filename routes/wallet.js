const router = require("express").Router();
const Wallet = require('../models/Wallet');
const WalletTransactions = require('../models/WalletTransactions');
const Payment = require('../models/Payment');
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
	try {
        const payment = await Payment.find({ "user": req.params.id});
        return res.status(200).json(payment);
    } catch(err) {
        return res.status(500).json(err.message);
    }
});


router.post("/transactions/:id", async(req, res) => {
	try {
        const transactions = await WalletTransactions.find({ "user": req.params.id});
        return res.status(200).json(transactions);
    } catch(err) {
        return res.status(500).json(err.message);
    }
});

router.post("/balance/:id", async(req, res) => {
	try {
		const Wallets = await Wallet.findOne({ "user": req.params.id }).collation({ locale: 'en', strength: 2 });
        res.status(200).json(Wallets);
    } catch(err) {
        res.status(500).json(err);
    }
});

/************************* */

module.exports = router;