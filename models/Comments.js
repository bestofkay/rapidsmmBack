const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    description: { type: String, required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agents', required: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchants', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true })

module.exports = mongoose.model("Comment", commentSchema);