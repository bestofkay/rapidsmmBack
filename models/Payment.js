const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    method: {type: String, required: true},
    total_amount: { type: Number, required: true },
	tType:{ type: String },
    payment_status: { type: String, default: "Pending" },
    reference: { type: String, index: true }
}, { timestamps: true })

module.exports = mongoose.model("Payment", paymentSchema);