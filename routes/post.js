const { Router } = require("express");
const Post = require("../models/post");
const router = Router();
const multer = require("multer");
const path = require("path");
const { uploadFileToS3, deleteFile } = require("../services/S3_Upload");
const { loginRequired } = require("../middlewares/authorization");

const upload = multer({ dest: "uploads/" });

router.post(
  "/comments/:post_id/:commenter_id",
  loginRequired("token"),
  async (req, res) => {
    const { post_id, commenter_id } = req.params;
    const { text } = req.body;

    try {
      // Find the post by ID
      const post = await Post.findById(post_id);

      if (!post) {
        return res.status(404).json({ error: "Post not found." });
      }

      // Create a new comment
      const newComment = {
        text: text,
        createdBy: commenter_id,
      };

      post.comments.push(newComment);

      await post.save();

      return res.status(302).redirect(`/viewpost/${post_id}`);
    } catch (error) {
      console.error("Error adding comment:", error);
      return res.status(500).json({ error: "Internal Server Error." });
    }
  }
);

router.get("/viewpost/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("createdBy") // Populate createdBy field of the post
      .populate({
        path: "comments", // Populate comments array
        populate: {
          path: "createdBy", // Populate createdBy field of each comment
        },
      });

    return res.render("post", {
      current_user_id: req.user?._id || null,
      post: post,
    });
  } catch (error) {
    console.error("Error fetching post and comments:", error);
    return res.status(500).send("Internal Server Error.");
  }
});

router.post("/uploadPost", upload.single("coverImage"), async (req, res) => {
  const { title, body, createdBy, description, location } = req.body;

  // Get the uploaded file from req.file
  const file = req.file;

  // Get bucket name from your application logic
  const bucketName = process.env.S3_BUCKET; // Replace with your S3 bucket name

  // Upload file to S3
  const coverImageURL = await uploadFileToS3(bucketName, file);
  // Delete file from local uploads folder
  deleteFile(file.path);
  // Create the post with the cover image URL
  const post = await Post.create({
    body,
    title,
    location,
    description,
    createdBy,
    coverImageURL,
  });

  return res.redirect(`/viewpost/${post._id}`);
});

router.get("/uploadPost/:id", loginRequired("token"), (req, res) => {
  res.render("createPost", {
    user: req.user,
  });
});

router.get("/like/:postId/:user_id", async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.user_id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLikedIndex = post.likes.indexOf(userId);

    if (alreadyLikedIndex !== -1) {
      // If user already liked the post, remove their like
      post.likes.splice(alreadyLikedIndex, 1);
      await post.save();
      return res.json({ message: "Unliked" });
    } else {
      // If user hasn't liked the post, add their like
      post.likes.push(userId);
      await post.save();
      return res.json({ message: "Liked" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
