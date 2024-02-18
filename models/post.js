const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    coverImageURL: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    comments: [commentSchema], // Array of comments
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
);

const Post = model("post", postSchema);

module.exports = Post;
