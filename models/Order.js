const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: {type: String, required: true},
	quantity:{type: Number},
    total_amount: { type: Number, required: true },
    order_status: { type: String, default: "Pending" },
    payment_status: { type: String, default: "Pending" },
    reference: { type: String }
}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema);