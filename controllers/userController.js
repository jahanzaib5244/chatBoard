const User = require('../Models/userModel');


exports.getAllUsers = async (req, res) => {
    const users = await User.find();
    console.log(users);
    if (users) {
        res.status(200).json(users);
    }
    else {
        res.status(404).json({ errorMessage: 'No user found!' });
    }
}

exports.getUserById = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id });
    if (user) {
        res.status(200).json(user);
    }
    else {
        res.status(404).json({ errorMessage: 'No user found!' });
    }
}

exports.signin = async (req, res) => {
    console.log(req.body.email, req.body.password);
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    console.log(user);
    if (user) {
        res.status(200).json({ user: user, successMesssage: 'Logged in!' });
    } else {
        res.status(400).json({ errorMessage: 'Invalid credentials' });
    }
}

exports.signUp = async (req, res) => {
    const user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone
    });

    const saveUser = await user.save();
    if (saveUser) {
        res.status(200).json({ user: saveUser, successMesssage: 'Details saved!' });
    } else {
        res.status(400).json({ errorMessage: 'Account not created. Please try again' });
    }
}
