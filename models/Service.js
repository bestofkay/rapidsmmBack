const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    title: { type: String },
    category: { type: String },
    subcategory: { type: String },
    serviceID: { type: String, index: true },
    listing_price: { type: Number },
    price: { type: Number },
    minimum: { type: Number },
    maximum: { type: Number }

}, { timestamps: true })

module.exports = mongoose.model("Service", serviceSchema);