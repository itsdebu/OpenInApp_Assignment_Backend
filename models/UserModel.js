const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

    phone_no: {
        type: Number,
        required: true,
        unique: true,
    },

    priority: {
        type: Number,
        enum: [0, 1, 2],
        default: 0,
    },

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

const User = mongoose.model('User', userSchema)

module.exports = User;