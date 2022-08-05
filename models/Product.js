const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    short_description: { type: String, required: true },
    full_description: { type: String },
    image: { type: String, required: true },
    images: [{ type: String }],
    listing_price: { type: Number, required: true },
    price: { type: Number, required: true },
    usd_price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agents', required: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchants', required: true },
    location: { type: String, required: true },
    quantityInStock: { type: Number, required: true },
    brand: { type: String, required: true },
    deliveryFeesWithin: { type: Number, default: 0 },
    deliveryFeesOutside: { type: Number, default: 0 },
    deliveryTimeWithin: { type: String, required: true },
    deliveryTimeOutside: { type: String, required: true },
    productType: { type: String, required: true }

}, { timestamps: true })

module.exports = mongoose.model("Product", productSchema);