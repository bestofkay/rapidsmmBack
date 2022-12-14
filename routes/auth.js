const router = require("express").Router();
const CryptoJS = require("crypto-js");
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require('passport');
const dotenv = require("dotenv");
const { OAuth2Client } = require('google-auth-library');
const sendGridMail = require('@sendgrid/mail');
const otpGenerator = require('otp-generator')

dotenv.config();

const client = new OAuth2Client(process.env.CLIENT_ID);
sendGridMail.setApiKey(process.env.SENDGRIDAPIKEY);

//GOOGLE

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "https://rapidsmm.herokuapp.com/api/auth/google_callback",
        passReqToCallback: true,
        scope: ['profile', 'email']
    },
    async(request, accessToken, refreshToken, profile, done) => {
        try {
            const findUser = await User.findOne({ email: profile.emails[0].value });
            // if user exists return the user 
            if (findUser) {
                return done(null, findUser);
            }
            // if user does not exist create a new user 
            const newUser = new User({
                username: profile.given_name,
                email: profile.emails[0].value,
                confirmation_code: uuidv4()
            });
            try {
                const savedUser = await newUser.save();
                const findUser = await User.findOne({ email: profile.emails[0].value });
                // if user exists return the user 
                if (findUser) {
                    const newWallet = new Wallet({
                        user: findUser.id,
                        total_amount: 0
                    });
                    const savedWallet = await newWallet.save();
                    return done(null, findUser);
                }
            } catch (err) {
                return done(err, false);
            }
        } catch (error) {
            return done(error, false)
        }
    }
));

router.get("/verify_user", async(req, res) => {   
    const authHeader = req.headers.token;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_KEY, async (err, user) => {
		if (err) { res.status(401).json("Token is not valid!"); } 
		else {
		const findUser = await User.findById(user.id);
		const { password, ...others } = findUser._doc;

        return res.status(200).json({...others});
        }
        });
    } else {
        res.status(401).json("You are not authenticated");
    }
});

router.post("/other_register",
  
    async(req, res) => {
       
        let id = req.body.id;
		const findUser = await User.findById(id);
        // if user exists return the user 
        if (findUser) {
            const accessTokens = jwt.sign({ id: findUser.id },
                process.env.JWT_KEY, { expiresIn: "1d" }
            );
            const { password, ...others } = findUser._doc;
            res.status(200).json({...others, accessTokens });
        }
    });

//Register a user
router.post("/register",
    body('email', 'Invalid email').isEmail(),
    body('password', 'Minimum length of 5').isLength({ min: 5 }),
    body('username', 'Minimum length of 3').isLength({ min: 2 }),
    async(req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;
        let phone = req.body.phone;
		let code = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false })

        const newUser = new User({
            username: username,
            password: CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString(),
            email: email,
            phone: phone,
            confirmation_code: code,
			is_fraud: false,
            confirm_user: true
        })
        try {

            const savedUser = await newUser.save();
            //Create New Wallet
            const findUser = await User.findOne({ email: email });
            const newWallet = new Wallet({
                user: findUser.id,
                total_amount: 0
            });
            const savedWallet = await newWallet.save();
			const body = `Here is your OTP for confirmation :: ${code}`;
			const details = {
			to: email,
			from: 'bestofkay@gmail.com',
			subject: 'OTP Confirmation',
			text: body,
			html: `<strong>${body}</strong>`,
			};
				
			await sendGridMail.send(details);
            res.status(201).json(savedUser);
        } catch (err) {
            res.status(500).json({"status":false, "error":err});
        }

    });

// Login a User
router.post("/login",
    body('email', 'Invalid email').isEmail(),
    async(req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        try {
            const findUser = await User.findOne({ email: req.body.email });
			
            if (!findUser) {
                return res.status(500).json({"status":false, "error":"Invalid login credentials"});
            }
            const hashedPassword = CryptoJS.AES.decrypt(findUser.password, process.env.SECRET_KEY);
            const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);
		
            if (Originalpassword !== req.body.password) {
               return res.status(500).json({"status":false, "error":"Invalid login credentials"});
            } else {
                const accessToken = jwt.sign({ id: findUser.id },
                    process.env.JWT_KEY, { expiresIn: "10d" }
                );
                const { password, ...others } = findUser._doc;
               return res.status(200).json({...others, accessToken });
            }

        } catch (err) {
           return res.status(500).json(err);
        }

    });

router.post("/confirm", async(req, res) => {
	const email = req.body.email;
	const code = req.body.otp
    try {
        const user = await User.findOne({email:email, confirmation_code: code });
        const { password, ...others } = user._doc;
        const updateUser = await User.findByIdAndUpdate(others._id, { $set: { confirm_user: true } }, { new: true });
        //res.status(200).json("User Verified");
        res.status(200).json(others._id);
    } catch {
        res.status(500).json(err);
    }
});

router.post("/resend_code", async(req, res) => {

	const email = req.body.email;
	let code = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
	const findUser = await User.findOne({ email: email });

	const { password, ...others } = findUser._doc;
    const updateUser = await User.findByIdAndUpdate(others._id, { $set: { confirmation_code: code } }, { new: true });

	const body = `Here is your OTP for confirmation :: ${code}`;
			const details = {
			to: email,
			from: 'bestofkay@gmail.com',
			subject: 'OTP Confirmation',
			text: body,
			html: `<strong>${body}</strong>`,
			};

	await sendGridMail.send(details);
    res.status(201).json('Email sent successfully');
});

router.get("/auth/google",
    passport.authenticate("google", { scope: ['profile', 'email'] })
);

router.get("/google_callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
		return res.redirect('https://rapidsmm.netlify.app/authorize?token='+req.user.id);
    }
);

module.exports = router;