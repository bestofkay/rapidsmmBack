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

let accessToken = "";
let refreshToken = "";

router.post("/create/", async(req, res) => {
    const body = {
        "env": {
            "terminalType": "APP"
        },
        "merchantTradeNo": "214481455",
        "orderAmount": 25.17,
        "currency": "BUSD",
        "goods": {
            "goodsType": "01",
            "goodsCategory": "D000",
            "referenceGoodsId": "7876763A3B",
            "goodsName": "Ice Cream",
            "goodsDetail": "Greentea ice cream cone"
        }
    }

    const bTime = Date.now();
    var nonceID = crypto.randomBytes(16).toString('hex');
    var stringPayload = bTime + " \n" + nonceID + " \n" + JSON.stringify(body) + " \n";
    var stringSignature = crypto.createHmac("sha512", process.env.BINANCEPAY_SECRETKEY).update(stringPayload).digest('hex').toUpperCase();

    try {
        const response = await axios.post('https://bpay.binanceapi.com/binancepay/openapi/v2/order/', body, {
            headers: {
                'Content-Type': 'application/json',
                'BinancePay-Timestamp': bTime,
                'BinancePay-Nonce': nonceID,
                'BinancePay-Certificate-SN': process.env.BINANCEPAY_APIKEY,
                'BinancePay-Signature': stringSignature,
            }
        });
        console.log(response.data);

    } catch (e) {
        res.status(500).json(e);
    }

});

module.exports = router;