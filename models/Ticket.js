const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	title: { type: String, required: true },
    full_description: { type: String },
    status: {type: String, required: true, enum: ['opened', 'pending', 'closed']},
}, { timestamps: true })

module.exports = mongoose.model("Ticket", ticketSchema);