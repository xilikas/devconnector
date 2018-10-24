// User auth

const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

// Load User model
const User = require("../../models/User");

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users works" }));

// @route   GET api/users/register
// @desc    Register user
// @access  Public
router.post("/register", (req, res) => {
    User.findOne({ email: req.body.email }).then(user => {
        // A user (data) is returned
        if (user) {
            // If the user with this email address is found, throw error
            return res.status(400).json({ email: "Email already exists" });
        } else {
            // Get avatar image
            const avatar = gravatar.url(req.body.email, {
                s: "200", // Size
                r: "pg", // Rating
                d: "mm" // Default
            });

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar: avatar, // can shorten to avatar in ES6
                password: req.body.password
            });

            // Encrypt password; password gets hashed
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save() // Save user to database
                        .then(user => res.json(user)) // Send user data back to world
                        .catch(err => console.log(err)); // If something happens, send error to console
                });
            });
        }
    });
});

// @route   GET api/users/login
// @desc    Login user / Returning JWT (JSON Web Token)
// @access  Public
router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({ email }).then(user => {
        // Check for user
        if (!user) res.status(404).json({ email: "User not found" });

        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User matched
                const payload = {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                };

                // Sign token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: `Bearer ${token}`
                        });
                    }
                );
            } else {
                return res.status(400).json({ password: "Password incorrect" });
            }
        });
    });
});

module.exports = router;
