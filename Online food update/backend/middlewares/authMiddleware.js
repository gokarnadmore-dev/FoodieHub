const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ======================
// AUTH MIDDLEWARE (USER)
// ======================

exports.protect = async (req, res, next) => {

    try {

        let token;


        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {

            token = req.headers.authorization.split(" ")[1];

        }



        if (!token) {

            return res.status(401).json({
                message: "Not authorized, no token"
            });

        }



        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );



        const user = await User.findById(decoded.id)
        .select("-password");



        if (!user) {

            return res.status(401).json({
                message: "User not found"
            });

        }



        req.user = user;

        next();



    } catch (error) {

        res.status(401).json({
            message: "Not authorized, token failed"
        });

    }

};




// ======================
// ADMIN MIDDLEWARE
// ======================

exports.admin = (req, res, next) => {

    try {

        if (!req.user) {

            return res.status(401).json({
                message: "Not authorized"
            });

        }



        if (!req.user.isAdmin) {

            return res.status(403).json({
                message: "Admin access only"
            });

        }



        next();



    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};