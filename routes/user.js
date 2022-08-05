const router = require("express").Router();
const User = require('../models/User');
const VerifyToken = require("./verifyToken")

router.get("/find/:id", VerifyToken, async(req, res) => {
    try {

        const user = await User.findById(req.params.id);
        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch {
        res.status(500).json(err);
    }

});

router.get("/", VerifyToken, async(req, res) => {
    try {

        const users = await User.find();
        //const { password, ...others } = user._doc;
        res.status(200).json(users);
    } catch {
        res.status(500).json(err);
    }

});

router.post("/update", async(req, res) => {
    try {
        let fullname = req.body.name;
        let profession = req.body.profession;
        let about = req.body.about;
        let timezone = req.body.timezone;
        let _id = req.body.id;
        const updateUser = await User.findByIdAndUpdate(_id, { $set: { fullname: fullname, profession: profession, about: about, timezone: timezone } }, { new: true });
        res.status(200).json({ status: true, result: "User data updated successfully" });
    } catch {
        res.status(500).json(err);
    }

});

module.exports = router;