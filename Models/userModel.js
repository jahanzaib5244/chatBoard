const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    role: {
        type: Number,
        default: '0'
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    phone: {
        type: String,
        required: true
    }
  
}, {timestamps: true}
);

const userModel = new mongoose.model('User', userSchema);
module.exports = userModel;
