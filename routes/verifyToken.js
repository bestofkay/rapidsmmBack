const jwt = require('jsonwebtoken');

const VerifyToken = (req, res, next) => {
    const authHeader = req.headers.token;
    if (authHeader) {

        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_KEY, (err, user) => {

            if (err) { res.status(401).json("Token is not valid!"); } else {
                req.user = user;
                next();
            }
        });
    } else {
        res.status(401).json("You are not authenticated");
    }
};


module.exports = VerifyToken;