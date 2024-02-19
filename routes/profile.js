const { Router } = require("express");
const Post = require("../models/post");
const router = Router();
const { loginRequired } = require("../middlewares/authorization");
const multer = require("multer");
const path = require("path");
const {
  deleteFile,
  uploadFileToS3,
  deleteFileFromS3,
} = require("../services/S3_Upload");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/profile/:id", loginRequired("token"), async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.params.id }).sort({
      createdAt: -1,
    });
    res.render("profile", { posts, user: req.user });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/likedpost/:id", loginRequired("token"), async (req, res) => {
  try {
    const userId = req.params.id;
    const posts = await Post.find({ likes: userId }).sort({ createdAt: -1 });
    res.render("likedpost", { posts, user: req.user });
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/delete/:id/:user_id", loginRequired("token"), async (req, res) => {
  try {
    const postToDeleteId = req.params.id;
    const post = await Post.findById(postToDeleteId);
    await deleteFileFromS3(post.coverImageURL);
    await Post.findByIdAndDelete(postToDeleteId);

    res.redirect(`/profile/${req.params.user_id}`);
  } catch (error) {
    console.error("Error while deleting the post:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/edit/:id", loginRequired("token"), async (req, res) => {
  try {
    const postToEditId = req.params.id;
    const post = await Post.findById(postToEditId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("updatePost", { post });
  } catch (error) {
    console.error("Error while editing the post:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/edit/:id", upload.single("coverImage"), async (req, res) => {
  try {
    const postId = req.params.id;

    const { title, location, description, body } = req.body;
    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        title,
        location,
        description,
        body,
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send("Post not found");
    }

    res.redirect(`/viewpost/${updatedPost._id}`); // Redirect to the updated post's page
  } catch (error) {
    console.error("Error while updating the post:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
