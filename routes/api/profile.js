const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
// const keys = require("../../config/keys");

// Load validation
const validateProfileInput = require("../../validation/profile");

// Load Models
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Profile works" }));

// @route   GET api/profile/
// @desc    Gets the logged in users profile; Protected routes have payload with user information. Don't need id in URL
// @access  Private
router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const errors = {};
        Profile.findOne({ user: req.user.id })
            .populate("user", ["name", "avatar"]) // Get name and avatar from User injected data
            .then(profile => {
                if (!profile) {
                    errors.noprofile = "There is no profile for this user.";
                    return res.status(404).json(errors);
                }
                res.json(profile);
            })
            .catch(err => res.status(404).json(err));
    }
);

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get("/all", (req, res) => {
    const errors = {};

    Profile.find()
        .populate("user", ["name", "avatar"])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = "There are no profiles.";
                return res.status(404).json();
            }

            res.json(profiles);
        })
        .catch(err =>
            res.status(404).json({ profile: "There is no profiles." })
        );
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get("/handle/:handle", (req, res) => {
    const errors = {};

    Profile.findOne({ handle: req.params.handle })
        .populate("user", ["name", "avatar"])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user.";
                return res.status(400).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user_id
// @access  Public
router.get("/user/:user_id", (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.params.user_id })
        .populate("user", ["name", "avatar"])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "There is no profile for this user.";
                res.status(400).json(errors);
            }

            res.json(profile);
        })
        .catch(err =>
            res
                .status(404)
                .json({ profile: "There is no profile for this user." })
        );
});

// @route   POST api/profile/
// @desc    Create user or edit profile
// @access  Private
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { errors, isValid } = validateProfileInput(req.body);

        // Check validation
        if (!isValid) {
            // Return errors
            return res.status(400).json(errors);
        }

        // Get fields
        const profileFields = {};
        profileFields.user = req.user.id; // Logged in user from passport

        if (req.body.handle) profileFields.handle = req.body.handle;
        if (req.body.company) profileFields.company = req.body.company;
        if (req.body.website) profileFields.website = req.body.website;
        if (req.body.location) profileFields.location = req.body.location;
        if (req.body.bio) profileFields.bio = req.body.bio;
        if (req.body.status) profileFields.status = req.body.status;
        if (req.body.githubUsername)
            profileFields.githubUsername = req.body.githubUsername;

        // Skills - split into array. Will come in as comma seperated values
        if (typeof req.body.skills !== "undefined") {
            profileFields.skills = req.body.skills.split(",");
        }

        // Social
        profileFields.social = {};
        if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if (req.body.facebook)
            profileFields.social.facebook = req.body.facebook;
        if (req.body.linkedin)
            profileFields.social.linkedin = req.body.linkedin;
        if (req.body.instagram)
            profileFields.social.instagram = req.body.instagram;

        Profile.findOne({ user: req.user.id }).then(profile => {
            if (profile) {
                // Update
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                ).then(profile => res.json(profile)); // Sends profile to client
            } else {
                // Create

                // Check handle (don't want dupes for SEO purposes)
                Profile.findOne({ handle: profileFields.handle }).then(
                    profile => {
                        if (profile) {
                            // Profile found that matches handle
                            errors.handle = "That handle is taken";
                            res.status(400).json(errors);
                        }

                        // No profile has handle
                        new Profile(profileFields)
                            .save()
                            .then(profile => res.json(profile));
                    }
                );
            }
        });

        // Experience and Education will have their own pages to add data to
    }
);

module.exports = router;
