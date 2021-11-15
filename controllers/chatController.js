const Chat = require('../Models/ChatModel');
const Cryptr = require('cryptr');
const config = require('../config/keys');
const cryptr = new Cryptr(config.crptrSecret);

exports.getChat = async (req, res) => {

    await Chat.find().populate('sender').exec((err, result) => {
        if (result) {
            return res.status(200).json({ result });
        }
        else {
            return res.status(404).json({ errorMessage: 'No Chats found' });
        }
    });
}

exports.indChat = async (req, res) => {
    await Chat.find({ "$or": [{ "sender": req.body.userId, "receiver": req.body.receiverId }, { "sender": req.body.receiverId, "receiver": req.body.userId }] }).populate("sender").exec((error, result) => {
        if (error) {
            res.status(404).json({ errorMessage: 'No Chats found' })
        } else {
            result.map(r => r.message = cryptr.decrypt(r.message));
            res.status(200).json({ result });
        }
    })
}

exports.chatByGroups = async (req, res) => {
    await Chat.find({ group: req.body.groupId }).populate("sender").exec((error, result) => {
        if (error) {
            res.status(404).json({ errorMessage: 'No Group Chats found' })
        } else {
            result.map(r => r.message = cryptr.decrypt(r.message));
            res.status(200).json({ result });
        }
    })
}