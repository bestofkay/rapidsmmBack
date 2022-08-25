const Payment = require('../../models/Payment');
const Wallet = require('../../models/Wallet');
const Order = require('../../models/Order');
const Service = require('../../models/Service');
const WalletTransactions = require('../../models/WalletTransactions');
const dotenv = require("dotenv");
const axios = require('axios').default;
const crypto = require("crypto");
dotenv.config();
var coinbase = require('coinbase-commerce-node');
var Client = coinbase.Client;
import cron from 'node-cron';
import { EVERY_5_MINUTES, EVERY_FIRSTDAY_MONTH } from './scheduleConstants';

Client.init(process.env.COINBASE_PAYOUT);

const confirmBin = () => {
	const value={};
	const payments = await Payment.find({ payment_status: { $ne: "Completed" }, method: "Binance" }).collation({ locale: 'en', strength: 2 });

	const listPayments = payments.map(listRes => {

	let reference = listRes.reference;
	let userID = listRes.user;
	dispatch_request(
		'POST', 
		'/binancepay/openapi/v2/order/query',
		{
			"prepayId": reference
		}
	  )
	  .then(response => value = response)
	  .catch(error => { console.log(error); });

	  const newStatus = value.status;
        try {
            await Payment.updateOne({reference:reference}, { $set: {payment_status:newStatus}}) 
        } catch (err) {
        }

	  if(value.status == "SUCCESS" ){
		await Wallet.updateOne( { user: userID },{ $inc: { total_amount: value.orderAmount }});	
		//Create Wallet Transactions
		const newTrans = new WalletTransactions({
			user: req.body._id,
			amount: value.orderAmount,
			reference: "Funding Wallet",
		});
		try {
			await newTrans.save();
		} catch (err) {
		}
		
	  }
	});
	return;
}

const confirmCoin = () => {
	
	var Charge = coinbase.resources.Charge;
	
	const value={};
	const payments = await Payment.find({ payment_status: { $ne: "Completed" }, method: "Coinbase" }).collation({ locale: 'en', strength: 2 });

	const listPayments = payments.map(listRes => {

	let reference = listRes.reference;
	let userID = listRes.user;
	Charge.retrieve(reference, function (error, response) {
		if(response['timeline'][0]['status'] == 'NEW') {
			try {
				
					await Payment.updateOne({reference:reference}, { $set: {payment_status:response['timeline'][1]['status']}});
					if(response['timeline'][2]['status'] == 'COMPLETED') {
					await Payment.updateOne({reference:reference}, { $set: {payment_status:response['timeline'][2]['status']}});
					await Wallet.updateOne( { user: req.body._id },{ $inc: { total_amount: response['orderAmount'] }});	
					const newTrans = new WalletTransactions({
						user: userID,
						amount: response['orderAmount'],
						reference: "Funding Wallet",
					});
					try {
						await newTrans.save();
					} catch (err) {
					}
				}
			} catch(error) {
			  console.log(error);  
			}
		  } else {
			
		  }
	  });	
});
return;  
};


const confirmNPR = () => {
	var Charge = coinbase.resources.Charge;
	Charge.retrieve('H34J7CVX', function (error, response) {
		console.log(error);
		console.log(response);
	  });
	  
};


function hash_signature(query_string) {
	return crypto
		.createHmac('sha512', process.env.BINANCEPAY_SECRETKEY)
		.update(query_string)
		.digest('hex');
  }
  
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

  const confirmOrder = () =>{
        const orders = await Order.find({ order_status: { $ne: "Completed" } }).collation({ locale: 'en', strength: 2 });
		const listOrders = orders.map(listRes => {
		let reference = listRes.reference;
				
		const URL = 'https://smmfollows.com/api/v2';
		const apiKey = process.env.SMMFOLLOWS;
		const body = {
			'key': apiKey,
			'action': 'status',
			'order': reference,
		};
       // const newRes = response.data;
	   axios.post(URL, body)
	  .then(function (response) {
		const newStatus =response.status;
        try {
            await Order.updateOne({reference:reference}, { $set: {order_status:newStatus}}) 
        } catch (err) {
        }

	  })
	  .catch(function (error) {
		console.log(error);
	  });

		});
		return;
  };

  const createProducts = () =>{

	try {
        //const response = await axios.get(`https://www.qqtube.com/v1-api?api_key=${process.env.QQTMSS}&action=services`);
        const response = await axios.get(`https://smmfollows.com/api/v2?key=${process.env.SMMFOLLOWS}&action=services`);
        const newRes = response.data;

        const listProperties = newRes.map(listRes => {

            let properties = {};
            let listingPrice = listRes.rate * 3;
            listingPrice = listingPrice.toFixed(2);
			properties['category']=null;
			properties['subcategory']=null;
            if (listRes.max >= 100 && listRes.min >= 10 && listRes.service != null && listRes.service) {
                var text = listRes.name;
				properties['title'] = listRes.name;
					properties['listing_price'] = listingPrice;
					properties['minimum'] = listRes.min;
					properties['maximum'] = listRes.max;
					properties['price'] = listRes.rate;
					properties['serviceID'] = listRes.service;

                if (text.toLowerCase().includes("instagram")) {
                    properties['category'] = 'Instagram';
                    if (text.toLowerCase().includes("like")) {
                        properties['subcategory'] = 'Likes';
                    } else if (text.toLowerCase().includes("follow")) {
                        properties['subcategory'] = 'Followers';
                    } else if (text.toLowerCase().includes("view")) {
                        properties['subcategory'] = 'Views';
                    } else if (text.toLowerCase().includes("comment")) {
                        properties['subcategory'] = 'Comments';
                    }
                }


                if (text.toLowerCase().includes("youtube")) {
                    properties['category'] = 'Youtube';
                    if (text.toLowerCase().includes("like")) {
                        properties['subcategory'] = 'Likes';
                    } else if (text.toLowerCase().includes("subscriber")) {
                        properties['subcategory'] = 'Subscribers';
                    } else if (text.toLowerCase().includes("view")) {
                        properties['subcategory'] = 'Views';
                    } else if (text.toLowerCase().includes("comment")) {
                        properties['subcategory'] = 'Comments';
                    } else if (text.toLowerCase().includes("share")) {
                        properties['subcategory'] = 'Shares';
                    }
                }

                if (text.toLowerCase().includes("facebook")) {
                    properties['category'] = 'Facebook';
                    if (text.toLowerCase().includes("like") || text.toLowerCase().includes("react")) {
                        properties['subcategory'] = 'Likes';
                    } else if (text.toLowerCase().includes("follow")) {
                        properties['subcategory'] = 'Followers';
                    } else if (text.toLowerCase().includes("view")) {
                        properties['subcategory'] = 'Views';
                    } else if (text.toLowerCase().includes("comment")) {
                        properties['subcategory'] = 'Comments';
                    }
                }

                if (text.toLowerCase().includes("tiktok")) {
                    properties['category'] = 'Tiktok';
                    if (text.toLowerCase().includes("like")) {
                        properties['subcategory'] = 'Likes';
                    } else if (text.toLowerCase().includes("follow")) {
                        properties['subcategory'] = 'Followers';
                    } else if (text.toLowerCase().includes("view")) {
                        properties['subcategory'] = 'Views';
                    } else if (text.toLowerCase().includes("comment")) {
                        properties['subcategory'] = 'Comments';
                    }
                }

                if (text.toLowerCase().includes("twitter")) {
                    properties['category'] = 'Twitter';
                    if (text.toLowerCase().includes("like")) {
                        properties['subcategory'] = 'likes';
                    } else if (text.toLowerCase().includes("follow")) {
                        properties['subcategory'] = 'Followers';
                    } else if (text.toLowerCase().includes("view")) {
                        properties['subcategory'] = 'Views';
                    } else if (text.toLowerCase().includes("comment")) {
                        properties['subcategory'] = 'Comments';
                    }
                } else if (text.toLowerCase().includes("tweet") || text.toLowerCase().includes("retweet") || text.toLowerCase().includes("impression")) {
                    properties['subcategory'] = 'Tweet/Retweet/Impression';
                }

                if (text.toLowerCase().includes("linkedin")) {
                    properties['category'] = 'LinkedIn';
                    if (text.toLowerCase().includes("like")) {
                        properties['subcategory'] = 'likes';
                    } else if (text.toLowerCase().includes("follow")) {
                        properties['subcategory'] = 'Followers';
                    } else if (text.toLowerCase().includes("comment")) {
                        properties['subcategory'] = 'Comments';
                    }
                }

                if (text.toLowerCase().includes("soundcloud")) {
                    properties['category'] = 'SoundCloud';
                    if (text.toLowerCase().includes("like")) {
                        properties['subcategory'] = 'likes';
                    } else if (text.toLowerCase().includes("follow")) {
                        properties['subcategory'] = 'Subscribers';
                    } else if (text.toLowerCase().includes("Repost")) {
                        properties['subcategory'] = 'Repost';
                    } else if (text.toLowerCase().includes("comment")) {
                        properties['subcategory'] = 'Comments';
                    }
                }

                if (text.toLowerCase().includes("spotify")) {
                    properties['category'] = 'Spotify';
                    if (text.toLowerCase().includes("playlist") && text.toLowerCase().includes("premium")) {
                        properties['subcategory'] = 'Likes';
                    } else if (text.toLowerCase().includes("follow")) {
                        properties['subcategory'] = 'Followers';
                    }
                }

                if (text.toLowerCase().includes("pinterest")) {
                    properties['category'] = 'Pinterest';
                    if (text.toLowerCase().includes("like")) {
                        properties['subcategory'] = 'Likes';
                    } else if (text.toLowerCase().includes("subscriber")) {
                        properties['subcategory'] = 'Subscribers';
                    } else if (text.toLowerCase().includes("view")) {
                        properties['subcategory'] = 'Views';
                    } else if (text.toLowerCase().includes("comment")) {
                        properties['subcategory'] = 'Comments';
                    }
                }

                if (text.toLowerCase().includes("telegram")) {
                    properties['category'] = 'Telegram';
                    if (text.toLowerCase().includes("like")) {
                        properties['subcategory'] = 'Likes';
                    } else if (text.toLowerCase().includes("subscriber")) {
                        properties['subcategory'] = 'Subscribers';
                    } else if (text.toLowerCase().includes("view")) {
                        properties['subcategory'] = 'Views';
                    } else if (text.toLowerCase().includes("comment")) {
                        properties['subcategory'] = 'Comments';
                    }
                }

                if (text.toLowerCase().includes("website") && text.toLowerCase().includes("traffic")) {
                    properties['category'] = 'Websites Traffic';
                    if (text.toLowerCase().includes("from")) {
                        properties['subcategory'] = 'Organic';
                    }
                }
				if(properties['subcategory'] != null && properties['category'] != null){
					return properties;
				}
                

            }

        });

        const removecategory = await Service.deleteMany({});
        //const newCategory = new Service(listProperties);
        try {
            const savedCategory = await Service.insertMany(listProperties);
            await Service.deleteMany({ "category": null });
			const query = {"serviceID": null};
    		const result = await Service.deleteMany(query);
			return;
            //res.status(201).json({ status: true, result: savedCategory });
        } catch (err) {
			return;
            //res.status(500).json({ status: false, error: err.message });
        }

    } catch (err) {
		return;
       // console.log(err.message);
    }

  };


export default () => {
  cron.schedule(EVERY_5_MINUTES, () => {
	confirmOrder();
	confirmBin();
	confirmCoin();
	confirmNPR();
    // We'll do some work here...
  });

  cron.schedule(EVERY_FIRSTDAY_MONTH, () => {
    createProducts();
  });

}