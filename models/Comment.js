const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
	comment: { type: String, required: true },
    send_by: { type: String, enum: ['user', 'admin'] },
}, { timestamps: true })

module.exports = mongoose.model("Comment", commentSchema);