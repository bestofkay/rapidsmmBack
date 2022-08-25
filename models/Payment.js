const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    method: {type: String, required: true},
    total_amount: { type: Number, required: true },
    payment_status: { type: String, default: "Pending" },
    reference: { type: String }
}, { timestamps: true })

module.exports = mongoose.model("Payment", paymentSchema);