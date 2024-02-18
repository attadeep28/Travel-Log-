const chai = require("chai");
const expect = chai.expect;
const mongoose = require("mongoose");
const ValidationError = mongoose.Error.ValidationError;
const Post = require("../../models/post");

const connect = require("../../services/connectToDb");

describe("Testing Post model", () => {
  let samplePost;
  beforeEach(async () => {
    await connect(true);
    await Post.deleteMany({});
    samplePost = {
      title: "Test Post",
      body: "This is a test post",
      location: "Test Location",
      description: "Test Description",
    };
  });
  afterEach(async ()=>{
    await mongoose.disconnect();
  })
  it("Should Throw an error due to missing fields", (done) => {
    let post = new Post();
    post.validate().catch((err) => {
      expect(err).to.be.instanceOf(ValidationError);
      done();
    });
  });

  it("it should throw an error due to incorrect createdBy id", (done) => {
    let post = new Post(samplePost);
    post.createdBy = "invalidId"; // Assigning an invalid ID
    post.validate().catch((err) => {
      expect(err).to.be.instanceOf(ValidationError);
      done();
    });
  });

  it("it should create the post successfully with correct parameters", (done) => {
    let post = new Post(samplePost);
    post.save().then(() => {
      expect(post.title).to.equal("Test Post");
      done();
    });
  });
});
