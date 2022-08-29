const router = require("express").Router();
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const VerifyToken = require("./verifyToken")
const dotenv = require("dotenv");
const axios = require('axios').default;
dotenv.config();

router.get("/all", VerifyToken, async(req, res) => {
    try {
        const tickets = await Ticket.find().populate("user",{ username: 1, email:1 });
        return res.status(200).json(tickets);
    } catch(err) {
        return res.status(500).json(err.message);
    }

});


router.get("/comments/:id", VerifyToken, async(req, res) => {
	try {
        const ticketComments = await Ticket.findById(req.params.id).populate("comment");
        return res.status(200).json(ticketComments);
    } catch(err) {
        return res.status(500).json(err.message);
    }

});

router.get("/clients/:id", VerifyToken, async(req, res) => {
	try {
        const products = await Ticket.find({ "user": req.params.id});
        return res.status(200).json(products);
    } catch(err) {
        return res.status(500).json(err.message);
    }

});


router.get("/create", VerifyToken, async(req, res) => {

	let user = req.body._id;
	let title = req.body.title;
	let full_description = req.body.description;
	let status = 'closed';

	const newTicket = new Ticket({
		user,
		title,
		full_description,
		status
	})
	try {
		const savedTicket = await newTicket.save();
		return res.status(201).json({"status":true, "result":savedTicket});
	} catch (err) {
		return res.status(500).json({"status":false, "error":err});
	}
});


router.get("/comment", VerifyToken, async(req, res) => {

	let ticket = req.body.ticket_id;
	let comment = req.body.title;
	let send_by = req.body.sender;

	const newComment = new Comment({
		ticket,
		comment,
		send_by
	})
	try {
		const savedComment = await newComment.save();
		return res.status(201).json({"status":true, "result":savedComment});
	} catch (err) {
		return res.status(500).json({"status":false, "error":err});
	}
});


router.get("/close/:id", VerifyToken, async(req, res) => {
	$_id = req.params.id
	try {
		const updateTicket = await User.findByIdAndUpdate(_id, { $set: { status: "closed" } }, { new: true });
        res.status(200).json({ status: true, result: "Ticket closed successfully" });
    } catch(err) {
        return res.status(500).json(err.message);
    }

});


router.get("/open/:id", VerifyToken, async(req, res) => {
	$_id = req.params.id
	try {
		const updateTicket = await User.findByIdAndUpdate(_id, { $set: { status: "opened" } }, { new: true });
        res.status(200).json({ status: true, result: "Ticket opened successfully" });
    } catch(err) {
        return res.status(500).json(err.message);
    }
});


module.exports = router;