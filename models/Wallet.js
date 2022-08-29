const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    total_amount: { type: Number, required: true },
}, { timestamps: true })

module.exports = mongoose.model("Wallet", walletSchema);