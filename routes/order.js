const router = require("express").Router();
const Service = require('../models/Service');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const WalletTransactions = require('../models/WalletTransactions');
const dotenv = require("dotenv");
const axios = require('axios').default;
dotenv.config();

//Create Product Category
router.post("/purchase", async(req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
		const amount = req.body.amount;
		const WalletAmount = await Wallet.findOne({"user": req.body._id });
        if(amount > WalletAmount.total_amount){
			return res.status(400).json({nessage: 'Insufficient balance'});
		}

		const URL = 'https://smmfollows.com/api/v2';
		const apiKey = process.env.SMMFOLLOWS;
		const body = {
			'key': apiKey,
			'action': 'add',
			'service': req.body.serviceID,
			'link': req.boay.webLink,
			'quantity': req.body.quantity
		};
       // const newRes = response.data;
	   await axios.post(URL, body)
	  .then(async function(response) {

		const newOrder = new Order({
            user: req.body._id,
            product: req.body.title,
            total_amount: amount,
            order_status: 'Pending',
            payment_status: 'Completed',
			reference: response.order
        })
        try {
            const nOrder = await newOrder.save();
			await Wallet.updateOne( { user: req.body._id },{ $inc: {total_amount: -(amount)}});	
			return res.status(200).send({message: 'Order completed! Check status of your order'});

        } catch (err) {
        }

	  })
	  .catch(function (error) {
		res.status(500).json(error);
	  });

});

/************ CLIENT */
router.post("/history/:id", async(req, res) => {
	try {
        const orders = await Order.find({ "user": req.params.id});
        return res.status(200).json(orders);
    } catch(err) {
        return res.status(500).json(err.message);
    }
});

/********* CLIENT */
module.exports = router;