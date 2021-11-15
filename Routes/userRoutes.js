const express = require('express');
const { signUp, getAllUsers, getUserById, signin } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', signin);
router.get('/get', getAllUsers);
router.get('/get/:id', getUserById);

module.exports = router;