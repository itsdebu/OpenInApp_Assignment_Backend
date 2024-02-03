const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const { User } = require('../models')
const { signUpValidator, loginValidator } = require('../validators/user')


const UserSignup = async (req, res) => {
    const { error } = signUpValidator.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.message
        })
    }
    const { phone_no, priority, password } = req.body;

    try {

        const existingUser = await User.findOne({ phone_no });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered with this phone_no."
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            phone_no: phone_no,
            priority: priority,
            password: hashPassword
        });

        const user = await newUser.save();

        // Generating jwt token
        const tokenPayload = { userId: newUser._id, phone_no: newUser.phone_no };
        const accessToken = jwt.sign(tokenPayload, process.env.SECRETKEY, {
            expiresIn: '1h' //update it accordingly, currenlty token expiery time is 1hour
        });

        return res.status(200).json({
            token: accessToken,
            user,
            success: true
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};



const UserLogin = async (req, res) => {
    const { error } = loginValidator.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.message
        })
    }
    const { phone_no, password } = req.body;

    try {
        const user = await User.findOne({ phone_no });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: "User with this phone no is not registered",
            })
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(400).json({
                success: false,
                message: "password not match or Incorrect Password",
            })
        }

        // Generating jwt token
        const tokenPayload = { userId: user._id, phone_no: user.phone_number };
        const accessToken = jwt.sign(tokenPayload, process.env.SECRETKEY, { expiresIn: '365d' });


        res.status(200).json({
            message: "Logged In Successfully",
            user,
            token: accessToken,
            success: true
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            err
        });
    }
}


module.exports = { UserSignup, UserLogin };