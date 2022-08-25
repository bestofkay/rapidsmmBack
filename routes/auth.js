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
const { OAuth2Client } = require('google-auth-library')

dotenv.config();

const client = new OAuth2Client(process.env.CLIENT_ID)

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

/*
router.post("/google", async (req, res) => {
    const { token }  = req.body
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const { name, email } = ticket.getPayload();   
	try {
		const findUser = await User.findOne({ email: email });
		// if user exists return the user 
		if (findUser) {
			const accessToken = jwt.sign({ id: findUser.id },
				process.env.JWT_KEY, { expiresIn: "1d" }
			);
			const { password, ...others } = findUser._doc;
            return res.status(200).json({...others, accessToken });
		}
		// if user does not exist create a new user 
		const newUser = new User({
			username: name,
			email: email,
			confirmation_code: uuidv4(),
			is_fraud: false,
            confirm_user: true
		});
		try {
			const savedUser = await newUser.save();
			const findUser = await User.findOne({ email: email });
			// if user exists return the user 
			if (findUser) {
				const newWallet = new Wallet({
					user: findUser.id,
					total_amount: 0
				});
				const savedWallet = await newWallet.save();

				const accessToken = jwt.sign({ id: findUser.id },
					process.env.JWT_KEY, { expiresIn: "1d" }
				);
				const { password, ...others } = findUser._doc;
				return res.status(200).json({...others, accessToken});
				
			}
		} catch (err) {
			return res.status(500).json({"status":false, "error":err});
		}
	} catch (error) {
		return res.status(500).json({"status":false, "error":error});
	}

});
*/

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

        const newUser = new User({
            username: username,
            password: CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString(),
            email: email,
            phone: phone,
            confirmation_code: uuidv4()
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
			
            if (!findUser.confirm_user) {
               return res.status(500).json({"status":false, "error":"Unverified user"});
            }
            if (Originalpassword !== req.body.password) {
               return res.status(500).json({"status":false, "error":"Invalid login credentials"});
            } else {
                const accessToken = jwt.sign({ id: findUser.id },
                    process.env.JWT_KEY, { expiresIn: "1d" }
                );
                const { password, ...others } = findUser._doc;
               return res.status(200).json({...others, accessToken });
            }

        } catch (err) {
           return res.status(500).json(err);
        }

    });

router.get("/confirm/:id", async(req, res) => {
    try {
        const user = await User.findOne({ confirmation_code: req.params.id });
        const { password, ...others } = user._doc;
        const updateUser = await User.findByIdAndUpdate(others._id, { $set: { confirm_user: true } }, { new: true });
        //res.status(200).json("User Verified");
        res.status(200).json(others._id);
    } catch {
        res.status(500).json(err);
    }

});


router.get("/auth/google",
    passport.authenticate("google", { scope: ['profile', 'email'] })
);

router.get("/google_callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
		res.redirect('http://exmple.com?id='+req.user.id);
    }
);


module.exports = router;