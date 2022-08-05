const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model("SubCategory", subcategorySchema);