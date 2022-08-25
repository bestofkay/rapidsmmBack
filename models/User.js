const mongoose = require("mongoose");
const { generate } = require('mongoose-data-faker'); 

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    fullname: { type: String },
    profession: { type: String },
    about: { type: String },
    timezone: { type: String },
    userID: { type: Number },
    token: { type: String },
    is_fraud: { type: Boolean, default: false },
	is_admin: { type: Boolean, default: false },
    confirm_user: { type: Boolean, default: false },
    confirmation_code: { type: String }
}, { timestamps: true })

generate(userSchema, 50);
module.exports = mongoose.model("User", userSchema);