const router = require("express").Router();
const Service = require('../models/Service');
const dotenv = require("dotenv");
const axios = require('axios').default;
dotenv.config();

//Create Product Category
router.post("/create", async(req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions

    try {
        //const response = await axios.get(`https://www.qqtube.com/v1-api?api_key=${process.env.QQTMSS}&action=services`);
        const response = await axios.get(`https://smmfollows.com/api/v2?key=${process.env.SMMFOLLOWS}&action=services`);
        const newRes = response.data;

        const listProperties = newRes.map(listRes => {

            let properties = {};
            let listingPrice = listRes.rate * 3;
            listingPrice = listingPrice.toFixed(2);

            if (listRes.max >= 100 && listRes.min >= 10) {
                var text = listRes.name;

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


                if (text.toLowerCase().includes("Youtube")) {
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
                properties['title'] = listRes.name;
                properties['listing_price'] = listingPrice;
                properties['minimum'] = listRes.min;
                properties['maximum'] = listRes.max;
                properties['price'] = listRes.rate;
                properties['serviceID'] = listRes.service;

                return properties;

            }

        });

        const removecategory = await Service.deleteMany({});
        //const newCategory = new Service(listProperties);
        try {
            const savedCategory = await Service.insertMany(listProperties);
            await Service.deleteMany({ "category": null });

            res.status(201).json({ status: true, result: savedCategory });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }

    } catch (err) {
        console.log(err.message); //can be console.error
    }

});


router.get("/categories", async(req, res) => {
    try {
		
		let pat = 'http://localhost:3000/product:';
        const categories = await Service.distinct("category");
		//console.log(categories);
		const returnDatas=[];
		for (const key in categories){let returnData={};
		console.log(categories[key]);
			returnData['backURL'] = `http://localhost:3000/products/${categories[key]}`;
			returnData['category'] = categories[key];
			returnDatas.push(returnData)
		  }

        res.status(200).json(returnDatas);
    } catch {
        res.status(500).json(err.message);
    }

});

router.get("/subCategory/:id", async(req, res) => {
    try {

        //const user = await Service.find({ confirmation_code: req.params.id });
        const subcategories = await Service.distinct("subcategory", { "category": req.params.id }).collation({ locale: 'en', strength: 2 });
        res.status(200).json(subcategories);
    } catch {
        res.status(500).json(err);
    }

});

router.post("/products/", async(req, res) => {
    try {

        /* FIND WITH MULTIPLE OPTION*/
        const products = await Service.find({
            $and: [{
                    "category": req.body.category
                },
                {
                    "subcategory": req.body.subcategory
                }
            ]
        }).collation({ locale: 'en', strength: 2 });
        res.status(200).json(products);
    } catch {
        res.status(500).json(err);
    }

});

router.post("/products/:id", async(req, res) => {
    try {
        const products = await Service.find({ "category": req.params.id }).collation({ locale: 'en', strength: 2 });
        res.status(200).json({result:products, count:products.length});
    } catch {
        res.status(500).json(err);
    }

});

router.post("/product/update", async(req, res) => {
    try {
		let serviceID = req.body.key;
        let title = req.body.value.title;
        let listing_price = req.body.value.listing_price;
        let maximum = req.body.value.maximum;
        let minimum = req.body.value.minimum;
		let _id = req.body.value._id;
        const updateUser = await Service.findByIdAndUpdate(_id, { $set: { title: title, listing_price: listing_price, maximum: maximum, minimum: minimum } }, { new: true });
        res.status(200).json({ status: true, result: "Service data updated successfully" });
    } catch {
        res.status(500).json(err);
    }

});


router.post("/product/remove", async(req, res) => {
    try {
		let serviceID = req.body.key;
		const query = { serviceID: serviceID};
    	const result = await Service.deleteOne(query);
        res.status(200).json({ status: true, result: "Service deleted successfully" });
    } catch {
        res.status(500).json(err);
    }

});

module.exports = router;