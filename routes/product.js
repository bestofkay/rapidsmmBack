const router = require("express").Router();
const Service = require('../models/Service');
const dotenv = require("dotenv");
const axios = require('axios').default;
dotenv.config();

router.get("/:category/:subcategory", async(req, res) => {
    try {
        const categories = await Service.find({ "category": req.params.category, "subcategory": req.params.subcategory });
        return res.status(200).json(categories);
    } catch(err) {
        return res.status(500).json(err.message);
    }

});

router.get("/:category", async(req, res) => {
    try {
        //const user = await Service.find({ confirmation_code: req.params.id });
        const subcategories = await Service.distinct("subcategory", { "category": req.params.category }).collation({ locale: 'en', strength: 2 });
        res.status(200).json(subcategories);
    } catch(err) {
        res.status(500).json(err);
    }

});


router.get("/:id", async(req, res) => {
	try {
        const products = await Service.find({ "serviceID": req.params.id});
        return res.status(200).json(products);
    } catch(err) {
        return res.status(500).json(err.message);
    }

});


module.exports = router;