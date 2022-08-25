const router = require("express").Router();
const Service = require('../models/Service');
const dotenv = require("dotenv");
const axios = require('axios').default;
dotenv.config();

router.get("/categories", async(req, res) => {
    try {
        const categories = await Service.distinct("category");
		//console.log(categories);
		const returnDatas=[];
		for (const key in categories){let returnData={};
		console.log(categories[key]);
			returnData['backURL'] = `https://backendrapidsmm.herokuapp.com/products/${categories[key]}`;
			returnData['category'] = categories[key];
			returnDatas.push(returnData)
		  }

        res.status(200).json(returnDatas);
    } catch(err) {
        res.status(500).json(err.message);
    }

});

router.get("/subCategory/:id", async(req, res) => {
    try {

        //const user = await Service.find({ confirmation_code: req.params.id });
        const subcategories = await Service.distinct("subcategory", { "category": req.params.id }).collation({ locale: 'en', strength: 2 });
        res.status(200).json(subcategories);
    } catch(err) {
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
    } catch(err) {
        res.status(500).json(err);
    }

});

router.get("/products/:id", async(req, res) => {
    try {
        const products = await Service.find({ "category": req.params.id }).collation({ locale: 'en', strength: 2 });
        res.status(200).json({result:products, count:products.length});
    } catch(err) {
        res.status(500).json(err);
    }

});

router.post("/product/update", async(req, res) => {
    try {
        let title = req.body.title;
        let listing_price = req.body.listing_price;
        let maximum = req.body.maximum;
        let minimum = req.body.minimum;
		let _id = req.body._id;
        const updateUser = await Service.findByIdAndUpdate(_id, { $set: { title: title, listing_price: listing_price, maximum: maximum, minimum: minimum } }, { new: true });
        res.status(200).json({ status: true, result: req.body });
    } catch(err) {
		console.log(err);
        res.status(500).json(err);
    }

});

router.post("/product/remove", async(req, res) => {
    try {
		let serviceID = req.body.key;
		const query = { serviceID: serviceID};
    	const result = await Service.deleteOne(query);
        res.status(200).json({ status: true, result: "Service deleted successfully" });
    } catch(err) {
        res.status(500).json(err);
    }

});

module.exports = router;