const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agents', required: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchants', required: true },
    product: [{
        productId: {
            type: String
        },
        quantity: {
            type: Number,
            default: 1
        },
        price: {
            type: Number
        },
    }, ],
    total_amount: { type: Number, required: true },
    address: { type: String, required: true },
    order_status: { type: String, default: "Pending" },
    payment_status: { type: String, default: "Pending" },
    delivery_status: { type: String, default: "Pending" },
    reference: { type: String }
}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema);