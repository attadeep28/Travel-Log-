const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const rewire = require("rewire");
const supertest = require("supertest");
const app = require("../../index");
const Post = require("../../models/post");
const s3 = require("../../services/S3_Upload");
const jwt = require("jsonwebtoken");
const request = supertest(app);

describe("Post Routes", () => {
  beforeEach(() => {
    sinon.stub(jwt, "verify").returns({
      _id: "65c20ad6756d2ed7f09a05f1",
      Username: "attadeep@28",
      profileImageURL: "https://attu.s3.amazonaws.com/1707215573892-Cover",
    });
  });
  afterEach(() => {
    sinon.restore();
  });

  describe("GET /viewpost/:id", () => {
    // it("should render post view with post and comments when post is found", async () => {
    //   const findByIdStub = sinon.stub(Post, "findById").resolves();
    //   findByIdStub.callsFake(() => ({
    //     populate: sinon.stub().callsFake(() => ({
    //       populate: sinon.stub().resolves({
    //         // Simulate the data you want to return
    //         _id: "65cdfd602674f1a8d5c537f7",
    //         title: "Test Post",
    //         body: "This is a test post",
    //         location: "Test Location",
    //         description: "Test Description",
    //         likes: [],
    //         comments: [],
    //         createdAt: { $date: { $numberLong: "1708256461530" } },
    //         updatedAt: { $date: { $numberLong: "1708256461530" } },
    //         __v: { $numberInt: "0" },
    //       }),
    //     })),
    //   }));
    //   const res = await request.get("/viewpost/65cdfd602674f1a8d5c537f7");
    //   expect(res.status).to.eql(200);
    // });

    it("should return 500 Internal Server Error when an error occurs", async () => {
      sinon.stub(Post, "findById").throws(new Error("Database error"));

      const res = await request.get("/viewpost/65cdff68a0e92fd9edcbb670");
      expect(res.status).to.eql(500);
      expect(res.text).to.include("Internal Server Error");
    });
  });

  describe("GET /uploadPost/:id", () => {
    it("should render createPost view with user object when token is valid", async () => {
      const user = {
        _id: "65cdff68a0e92fd9edcbb66f",
        username: "testuser",
      };
      sinon.stub(jwt, "sign").returns("fakeToken");
      const res = await request
        .get("/uploadPost/65c1f69043e33439ecb908f4")
        .set("Cookie", "token=fakeToken")
        .set("User", JSON.stringify(user));

      expect(res.status).to.eql(200);

      expect(res.text).to.include("Create Post");
    });
  });

  describe("POST /uploadPost", () => {
    it("should create a new post and redirect to the viewpost route", async () => {
      const reqBody = {
        title: "Test Post",
        body: "This is a test post",
        createdBy: "valid_user_id",
        description: "Test Description",
        location: "Test Location",
      };

      const file = {
        fieldname: "coverImage",
        originalname: "test.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1000, // Replace with the appropriate file size
        destination: "/tmp",
        filename: "test.jpg",
        path: "/tmp/test.jpg",
        buffer: Buffer.from("Test file content"), // Replace with the appropriate file content
      };

      const mockPost = {
        _id: "mock_post_id",
      };
      sinon.stub(Post, "create").resolves(mockPost);

      const res = await request
        .post("/uploadPost")
        .field(reqBody)
        .attach("coverImage", file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });

      expect(res.status).to.eql(302);
      expect(res.header.location).to.eql(`/viewpost/${mockPost._id}`);
    });
  });

  describe("GET /like/:postId/:user_id", () => {
    it("Should like the post when it is not already liked", async () => {
      sinon.stub(jwt, "sign").returns("fakeToken");
      sinon.stub(Post, "findById").resolves({
        _id: { $oid: "65cdfd602674f1a8d5c537f7" },
        title: "Test Post",
        body: "This is a test post",
        location: "Test Location",
        description: "Test Description",
        createdBy: { $oid: "65cdfd602674f1a8d5c537f6" },
        likes: [],
        save: sinon.stub().resolves(),
      });
      const res = await request
        .get("/like/65c1f69043e33439ecb908f4/65cdff68a0e92fd9edcbb66f")
        .set("Cookie", "token=fakeToken");
      expect(res.status).to.eql(200);
      expect(res.body).to.eql({ message: "Liked" });
    });
    it("Should unlike the post when it is  already liked", async () => {
      sinon.stub(jwt, "sign").returns("fakeToken");
      sinon.stub(Post, "findById").resolves({
        _id: { $oid: "65cdfd602674f1a8d5c537f7" },
        title: "Test Post",
        body: "This is a test post",
        location: "Test Location",
        description: "Test Description",
        createdBy: { $oid: "65cdfd602674f1a8d5c537f6" },
        likes: ["65cdff68a0e92fd9edcbb66f"],
        save: sinon.stub().resolves(),
      });
      const res = await request
        .get("/like/65c1f69043e33439ecb908f4/65cdff68a0e92fd9edcbb66f")
        .set("Cookie", "token=fakeToken");
      expect(res.status).to.eql(200);
      expect(res.body).to.eql({ message: "Unliked" });
    });
    it("Should give 500 Internal Server Error", async () => {
      sinon.stub(jwt, "sign").returns("fakeToken");
      sinon.stub(Post, "findById").throws(new Error("Internal Server Error"));
      const res = await request
        .get("/like/65c1f69043e33439ecb908f4/65cdff68a0e92fd9edcbb66f")
        .set("Cookie", "token=fakeToken");
      expect(res.status).to.eql(500);
      expect(res.body).to.eql({ message: "Internal Server Error" });
    });
  });

  describe("/comments:post_id/:commenter_id", () => {
    it("should add a new comment to the post and redirect to the post view", async () => {
      const postId = "post_id";
      const commenterId = "commenter_id";
      const text = "This is a test comment.";
      sinon.stub(Post, "findById").resolves({
        _id: postId,
        comments: [],
        save: sinon.stub().resolves(),
      });

      const res = await request
        .post(`/comments/${postId}/${commenterId}`)
        .send({ text })
        .set("Cookie", "token=fakeToken");
      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal(`/viewpost/${postId}`);
    });

    it("should return a 404 error if the post is not found", async () => {
      sinon.stub(Post, "findById").resolves(null);
      const res = await request
        .post("/comments/post_id/commenter_id")
        .set("Cookie", "token=fakeToken");
      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal("Post not found.");
    });
    it("should return a 500 Internal Server Error ", async () => {
      sinon.stub(Post, "findById").throws(new Error("Error adding comment"));
      const res = await request
        .post("/comments/post_id/commenter_id")
        .set("Cookie", "token=fakeToken");
      expect(res.status).to.equal(500);
      expect(res.body.error).to.equal("Internal Server Error.");
    });
  });
});
