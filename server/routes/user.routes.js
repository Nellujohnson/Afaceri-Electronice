const { User } = require('../database/models');
const express = require('express');
const bcrypt = require('bcrypt');
// const {verifyToken} = require('../utils/token.js');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const existingUser = await User.findOne({
            where: {
                email: req.body.email
            }
        })
        if(existingUser) {
            return res.status(400).json({success: false, message: 'User already exists', data: {}});
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);
        const user = await User.create({
            ...req.body,
            password: hashedPassword,
        })
    } catch (error) {
        res.status(500).json({succes: false, message: 'Error creating user', data: error.message})
    }
})

module.exports = router;