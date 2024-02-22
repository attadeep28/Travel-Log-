const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const rewire = require("rewire");
const supertest = require("supertest");
const app = require("../../index");
const Post = require("../../models/post");
const jwt = require("jsonwebtoken");
const request = supertest(app);

describe("Index Routes", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("GET /", () => {
    it("should render index view ", async () => {
      sinon.stub(Post, "find").returns({
        sort: sinon.stub().resolves([]),
      });
      const res = await request.get("/");

      expect(res.status).to.eql(200);
    });
  });

  describe("GET /dashboard", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("should redirect to login page if user is not authenticated", async () => {
      sinon.stub(jwt, "verify").throws(new Error("JWT Error"));
      sinon.stub(jwt, "sign").returns("fakeToken");
      const res = await request
        .get("/dashboard")
        .set("Cookie", "token=fakeToken");
      expect(res.status).to.equal(302); // Expecting redirect status
      expect(res.header.location).to.equal("/login"); // Assuming the login page redirects to '/login'
    });

    it("should redirect to login", async () => {
      sinon.stub(jwt, "verify").returns({
        _id: "65c20ad6756d2ed7f09a05f1",
        Username: "attadeep@28",
        profileImageURL: "https://attu.s3.amazonaws.com/1707215573892-Cover",
      });
      sinon.stub(jwt, "sign").returns("fakeToken");
      const res = await request.get("/dashboard");
      expect(res.status).to.equal(302);
      expect(res.header.location).to.equal("/login");
    });

    it("should render the dashboard page", async () => {
      sinon.stub(Post, "find").returns({
        sort: sinon.stub().resolves([]),
      });
      sinon.stub(jwt, "verify").returns({
        _id: "65c20ad6756d2ed7f09a05f1",
        Username: "attadeep@28",
        profileImageURL: "https://attu.s3.amazonaws.com/1707215573892-Cover",
      });
      sinon.stub(jwt, "sign").returns("fakeToken");
      const res = await request
        .get("/dashboard")
        .set("Cookie", "token=fakeToken");

      expect(res.status).to.equal(200);
      expect(res.text).to.include("Latest Travel Experiences");
    });
  });

  describe("GET /search", () => {
    it("should return search results when title query parameter is provided", async () => {
      const mockResponse = [
        {
          _id: "post1",
          title: "Post 1",
          location: "Location 1",
          description: "Description 1",
        },
        {
          _id: "post2",
          title: "Post 2",
          location: "Location 2",
          description: "Description 2",
        },
      ];
      sinon.stub(Post, "aggregate").resolves(mockResponse);
      const res = await request.get("/search").query({ title: "keyword" });
      expect(res.status).to.eql(200);
      expect(res.body).to.eql(mockResponse);
    });

    it("should return an empty array when no title query parameter is provided", async () => {
      sinon.stub(Post, "aggregate").resolves(null);
      const res = await request.get("/search");
      expect(res.status).to.eql(200);
    });

    it("should return an empty array when an error occurs", async () => {
      sinon.stub(Post, "aggregate").throws(new Error("Database error"));
      const res = await request.get("/search").query({ title: "keyword" });
      expect(res.status).to.eql(200);
      expect(res.body).to.be.an("array").that.is.empty;
    });
  });

  describe("POST /search", () => {
    it("should render index view with search results when key is provided", async () => {
      sinon.stub(Post, "aggregate").resolves([]);
      const res = await request.post("/search").send({ key: "norway" });
      expect(res.status).to.eql(200);
    });

    it("should redirect to the root route when key is empty", async () => {
      const res = await request.post("/search").send({ key: "" });
      expect(res.status).to.eql(302);
      expect(res.header.location).to.eql("/");
    });

    it("should redirect to the root route when no search results are found", async () => {
      sinon.stub(Post, "aggregate").resolves();
      const res = await request.post("/search").send({ key: "keyword" });
      expect(res.status).to.eql(302);
      expect(res.header.location).to.eql("/");
    });

    it("should redirect to the root route when an error occurs", async () => {
      sinon.stub(Post, "aggregate").throws(new Error("Database error"));
      const res = await request.post("/search").send({ key: "keyword" });
      expect(res.status).to.eql(302);
      expect(res.header.location).to.eql("/");
    });
  });
});
