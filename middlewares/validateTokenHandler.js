const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require('../models/UserModel');

const validateToken = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.SECRETKEY);

            if (decoded && decoded.userId) {
                const userId = decoded.userId;

                // Check if the user exists in the database
                const user = await User.findById(userId);

                if (!user) {
                    return res.status(401).json({ success: false, error: 'User not found' });
                }

                console.log(user)

                req.user = { _id: userId }

                console.log(req.user._id)
                return next(); // Call next to proceed to the next middleware or route handler
            } else {
                return res.status(401).json({ success: false, error: 'Invalid token' });
            }
        } catch (err) {
            return res.status(401).json({ success: false, error: 'shobhan is not authorized or Invalid Token' });
        }
    } else {
        return res.status(401).json({ success: false, error: 'User is not authorized or token is missing' });
    }
};

module.exports = { validateToken };
