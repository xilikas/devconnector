const express = require("express");
const router = express.Router();
const passport = require("passport");

// Models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validation/post");

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Post works" }));

// @route   POST api/posts/
// @desc    Get posts
// @access  Public
router.get("/", (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ noPostFound: "No posts found" }));
});

// @route   POST api/posts/:id
// @desc    Get post by id
// @access  Public
router.get("/:id", (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err =>
            res.status(404).json({ noPostFound: "No post found with that ID" })
        );
});

// @route   POST api/posts/
// @desc    Create post
// @access  Private
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { errors, isValid } = validatePostInput(req.body);

        if (!isValid) {
            // If any errors, send 400 with errors object
            return res.status(400).json(errors);
        }

        const newPost = new Post({
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        });

        newPost.save().then(post => res.json(post));
    }
);

// @route   DELETE api/posts/:id
// @desc    Delete specific post
// @access  Private
router.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id }).then(profile => {
            Post.findById(req.params.id).then(post => {
                // Check post owner
                if (post.user.toString() !== req.user.id) {
                    return res
                        .status(401)
                        .json({ notAuthorized: "User not authorized." });
                }

                // Remove post from user
                post.remove()
                    .then(() => res.json({ success: true }))
                    .catch(err =>
                        res
                            .status(404)
                            .json({ postNotFound: "Post not found." })
                    );
            });
        });
    }
);

// @route   POST api/posts/like/:id
// @desc    Like a post
// @access  Private
router.post(
    "/like/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id }).then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (
                        post.likes.filter(
                            like => like.user.toString() === req.user.id
                        ).length > 0
                    ) {
                        // User already liked it; id would be stored in 'liked' array
                        return res.status(400).json({
                            alreadyLiked: "User already liked this post."
                        });
                    }

                    // Add user id to likes array
                    post.likes.push({ user: req.user.id });

                    post.save().then(post => res.json(post));
                })
                .catch(err =>
                    res.status(404).json({ postNotFound: "No post found" })
                );
        });
    }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.post(
    "/unlike/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id }).then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (
                        post.likes.filter(
                            like => like.user.toString() === req.user.id
                        ).length === 0
                    ) {
                        // User has not liked post
                        return res.status(400).json({
                            alreadyLiked: "You have not liked this post."
                        });
                    }

                    // Get remove index (index of user you want to remove from "liked" array)
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    // Splice out of array
                    post.likes.splice(removeIndex, 1);

                    post.save().then(post => res.json(post));
                })
                .catch(err =>
                    res.status(404).json({ postNotFound: "No post found" })
                );
        });
    }
);

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post(
    "/comment/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // Comments have the same structure as a post. Can use the same validation
        const { errors, isValid } = validatePostInput(req.body);

        if (!isValid) {
            // If any errors, send 400 with errors object
            return res.status(400).json(errors);
        }

        Post.findById(req.params.id)
            .then(post => {
                const newComment = {
                    text: req.body.text,
                    name: req.body.name,
                    avatar: req.body.avatar,
                    user: req.user.id
                };

                // Add to comments
                post.comments.unshift(newComment);

                post.save().then(post => res.json(post));
            })
            .catch(err =>
                res.status(404).json({ postNotFound: "No post found." })
            );
    }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
    "/comment/:id/:comment_id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Post.findById(req.params.id)
            .then(post => {
                // Check if comment exists
                if (
                    post.comments.filter(
                        comment =>
                            comment._id.toString() === req.params.comment_id
                    ).length === 0
                ) {
                    // Does not exist
                    return res.status(404).json({
                        commentDoesNotExist: "Comment does not exist."
                    });
                }

                // Get remove index
                const removeIndex = post.comments
                    .map(item => item._id.toString())
                    .indexOf(req.params.comment_id);

                post.comments.splice(removeIndex, 1);

                post.save().then(post => res.json(post));
            })
            .catch(err =>
                res.status(404).json({ postNotFound: "No post found." })
            );
    }
);

module.exports = router;
