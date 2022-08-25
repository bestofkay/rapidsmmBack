const router = require("express").Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const dotenv = require("dotenv");
const axios = require('axios').default;
const qs = require('qs');
dotenv.config();

let accessToken = "";
let refreshToken = "";

router.get("/callback/", async(req, res) => {
    const { code } = req.query;
    const data = qs.stringify({
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': process.env.COINBASE_CLIENT_ID,
        'client_secret': process.env.COINBASE_SECRET_ID,
        'redirect_uri': 'https://rapidsmm.herokuapp.com/api/coin/callback'
    });
    const config = {
        method: 'post',
        url: 'https://api.coinbase.com/oauth/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data
    };

    try {
        const response = await axios(config);
        // saving tokens for other requests
        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;

        const userResult = await customerDetails();

        const findUser = await User.findOne({ email: userResult.data.data.email });
        // if user exists return the user 
        if (findUser) {
            res.redirect('https://rapidsmm.netlify.app/signup?id='+findUser.id);
        }
        // if user does not exist create a new user 
        const newUser = new User({
            username: userResult.data.data.name,
            email: userResult.data.data.email,
            confirmation_code: uuidv4(),
            is_fraud: false,
            confirm_user: true
        });
        try {
            const savedUser = await newUser.save();
            const findUser = await User.findOne({ email: userResult.data.data.email });
            // if user exists return the user 
            if (findUser) {
                //Create New Wallet
                const newWallet = new Wallet({
                    user: findUser.id,
                    total_amount: 0
                });
                const savedWallet = await newWallet.save();
				res.redirect('https://rapidsmm.netlify.app/signup?id='+findUser.id);
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } catch (e) {
        res.status(500).json(e);
    }

});

// Gets the user details
const customerDetails = (async() => {

    const config = {
        method: 'get',
        url: 'https://api.coinbase.com/v2/user',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'CB-VERSION': '2021-06-23'
        }
    };

    try {
        const response = await axios(config);
        return response;
    } catch (e) {
        console.log("Could not get user", e.response.data)
    }

});





module.exports = router;