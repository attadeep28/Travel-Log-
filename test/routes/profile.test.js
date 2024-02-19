const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const rewire = require("rewire");
const supertest = require("supertest");
const app = require("../../index");
const Post = require("../../models/post");
const jwt = require("jsonwebtoken");
const request = supertest(app);
const { deleteFileFromS3 } = require("../../services/S3_Upload");

describe("Profile Route", () => {
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
  describe("GET /profile/:id", () => {
    it("should render the Profile page", async () => {
      sinon.stub(Post, "find").returns({
        sort: sinon.stub().resolves([]),
      });
      sinon.stub(jwt, "sign").returns("fakeToken");
      const res = await request
        .get("/profile/65c1f69043e33439ecb908f4")
        .set("Cookie", "token=fakeToken");

      expect(res.status).to.equal(200);
      expect(res.text).to.include("Your Post");
    });
    it("should give 500 Internal Server Error", async () => {
      sinon.stub(Post, "find").throws(new Error("Error fetching posts"));
      sinon.stub(jwt, "sign").returns("fakeToken");
      const res = await request
        .get("/profile/65c1f69043e33439ecb908f4")
        .set("Cookie", "token=fakeToken");

      expect(res.status).to.equal(500);
      expect(res.text).to.include("Internal Server Error");
    });
  });

  describe("GET /likedpost/:id", () => {
    it("should render the liked post page", async () => {
      sinon.stub(Post, "find").returns({
        sort: sinon.stub().resolves([]),
      });
      sinon.stub(jwt, "sign").returns("fakeToken");
      const res = await request
        .get("/likedpost/65c1f69043e33439ecb908f4")
        .set("Cookie", "token=fakeToken");

      expect(res.status).to.equal(200);
      expect(res.text).to.include("Post Liked By You");
    });
    it("should give 500 Internal Server Error", async () => {
      sinon.stub(Post, "find").throws(new Error("Error fetching posts"));
      sinon.stub(jwt, "sign").returns("fakeToken");
      const res = await request
        .get("/likedpost/65c1f69043e33439ecb908f4")
        .set("Cookie", "token=fakeToken");

      expect(res.status).to.equal(500);
      expect(res.text).to.include("Internal Server Error");
    });
  });

  describe("GET /delete/:id/:user_id", () => {
    // it("should delete post and redirect", async () => {
    //   sinon.stub(Post, "findByIdAndDelete");
    //   sinon.stub(Post, 'findById').resolves([]);
    //   const res = await request
    //     .get("/delete/65c1f8ba5155856db9a5fasssas64/65c1f69043e33439ecb908f4")
    //     .set("Cookie", "token=fakeToken");

    //   expect(res.status).to.equal(302);
    //   expect(res.header.location).to.equal("/profile/65c1f69043e33439ecb908f4");
    // });

    it("should delete the post and redirect to user profile page", async () => {
      const postToDeleteId = "65d1eccd707b71f5ee866d2d";
      const userId = "65c1f8ba5155856db9a5fb64";
      const mockPost = {
        _id: postToDeleteId,
        coverImageURL: "https://example.com/cover-image.jpg",
      };
      sinon.stub(Post, "findById").resolves(mockPost);
      sinon.stub(deleteFileFromS3);
      sinon.stub(Post, "findByIdAndDelete").resolves();

      const res = await request
        .get(`/delete/${postToDeleteId}/${userId}`)
        .set("Cookie", "token=fakeToken");
      expect(res.status).to.eql(302);
      expect(res.header.location).to.eql(`/profile/${userId}`);
    });

    it("should give status 500 while deleting post and redirect", async () => {
      sinon
        .stub(Post, "findByIdAndDelete")
        .throws(new Error("Error while deleting the post"));
      const res = await request
        .get("/delete/65c1f8ba5155856db9a5fasssas64/65c1f69043e33439ecb908f4")
        .set("Cookie", "token=fakeToken");

      expect(res.status).to.equal(500);
      expect(res.text).to.eql("Internal Server Error");
    });
  });

  describe("GET /edit/:id", () => {
    it("should give post to edit and render updatepost page", async () => {
      sinon.stub(Post, "findById").resolves({
        _id: { $oid: "65cdfd602674f1a8d5c537f7" },
        title: "Test Post",
        body: "This is a test post",
        location: "Test Location",
        description: "Test Description",
        createdBy: { $oid: "65cdfd602674f1a8d5c537f6" },
        likes: [],
        comments: [],
        createdAt: { $date: { $numberLong: "1707998560875" } },
        updatedAt: { $date: { $numberLong: "1707998560875" } },
        __v: { $numberInt: "0" },
      });
      const res = await request
        .get("/edit/65c1f8ba5155856db9a5fasssas64")
        .set("Cookie", "token=fakeToken");

      expect(res.status).to.equal(200);
    });
    it("should give 404 post not found", async () => {
      sinon.stub(Post, "findById");
      const res = await request
        .get("/edit/65c1f8ba5155856db9a5fasssas64")
        .set("Cookie", "token=fakeToken");

      expect(res.status).to.equal(404);
      expect(res.text).to.include("Post not found");
    });
    it("should give 500", async () => {
      sinon
        .stub(Post, "findById")
        .throws(new Error("Error while editing the post"));
      const res = await request
        .get("/edit/65c1f8ba5155856db9a5fasssas64")
        .set("Cookie", "token=fakeToken");

      expect(res.status).to.equal(500);
      expect(res.text).to.include("Internal Server Error");
    });
  });

  describe("POST /edit/;id", () => {
    it("Update post ", async () => {
      sinon.stub(Post, "findByIdAndUpdate").resolves({
        _id: { $oid: "65cdfd602674f1a8d5c537f7" },
        title: "Test Post",
        body: "This is a test post",
        location: "Test Location",
        description: "Test Description",
        createdBy: { $oid: "65cdfd602674f1a8d5c537f6" },
        likes: [],
        comments: [],
        createdAt: { $date: { $numberLong: "1707998560875" } },
        updatedAt: { $date: { $numberLong: "1707998560875" } },
        __v: { $numberInt: "0" },
      });
      const res = await request.post("/edit/65c1f8ba5155856db9a5fasssas64");
      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal("/viewpost/[object%20Object]");
    });
    it("give 404 ", async () => {
      sinon.stub(Post, "findByIdAndUpdate").resolves();
      const res = await request.post("/edit/65c1f8ba5155856db9a5fasssas64");
      expect(res.status).to.equal(404);
      expect(res.text).to.include("Post not found");
    });
    it("give 500", async () => {
      sinon
        .stub(Post, "findByIdAndUpdate")
        .throws(new Error("Error while updating the post"));
      const res = await request.post("/edit/65c1f8ba5155856db9a5fasssas64");
      expect(res.status).to.equal(500);
      expect(res.text).to.include("Internal Server Error");
    });
  });
});
