const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, default: "credit" },
    reference: { type: String, index: true }
}, { timestamps: true })

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);