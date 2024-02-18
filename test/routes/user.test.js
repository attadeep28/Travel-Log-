const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const rewire = require("rewire");
const supertest = require("supertest");
const app = require("../../index");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const request = supertest(app);

describe("User Routes", () => {
  afterEach(() => {
    sinon.restore();
  });
  describe("GET /login", () => {
    it("Should render login page", async () => {
      const res = await request.get("/login");
      expect(res.status).to.eql(200);
    });
  });
  describe("POST /login", () => {
    it("Should redirect to dashboard ", async () => {
      sinon.stub(User, "matchPasswordAndGenerateToken").resolves("faketoken");
      const res = await request.post("/login").send({
        Username: "username",
        password: "password",
      });
      expect(res.status).to.eql(302);
      expect(res.header.location).to.eql("/dashboard");
    });

    it("should return a 200 status with an error message on failed login", async () => {
      sinon
        .stub(User, "matchPasswordAndGenerateToken")
        .throws(new Error("Incorrect Password"));
      const res = await request.post("/login").send({
        username: "example_username",
        password: "wrong_password",
      });
      expect(res.status).to.eql(200);
      expect(res.text).to.include("Incorrect Username or Password");
    });
  });

  describe("GET /signup", () => {
    it("Should render signup page", async () => {
      const res = await request.get("/signup");
      expect(res.status).to.eql(200);
    });
  });
  describe("POST /signup", () => {
    it("should return a 302 redirect to /login on successful signup", async () => {
      sinon.stub(User, "create").resolves();

      const res = await request.post("/signup").send({
        Username: "new_user",
        Name: "New User",
        password: "password",
      });
      expect(res.status).to.eql(302);
      expect(res.header.location).to.eql("/login");
    });

    it("should return a 200 status with an error message on failed signup", async () => {
      sinon.stub(User, "create").throws(new Error("Username Already Exist"));
      const res = await request.post("/signup").send({
        Username: "existing_user",
        Name: "Existing User",
        password: "password",
      });
      expect(res.status).to.eql(200);
      expect(res.text).to.include("Username Already Exist");
    });
  });

  describe("GET /logout", () => {
    it("should clear the token cookie and redirect to '/'", async () => {
      const res = await request.get("/logout");

      expect(res.status).to.eql(302);

      expect(res.header.location).to.eql("/");

      const cookies = res.headers["set-cookie"];
      expect(cookies)
        .to.be.an("array")
        .that.includes("token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    });
  });

  describe("GET /forgot-password", () => {
    it("should render the forgot-password view", async () => {
      const res = await request.get("/forgot-password");
      expect(res.status).to.eql(200);
      expect(res.text).to.include("Forget Password");
    });
  });

  describe("POST /forgot-password", () => {
    it("should render reset-password page when a user is found by email", async () => {
      sinon.stub(User, "findOne").resolves({
        generateOTP: () => ({
          otp: "123456",
          otpExpiration: Date.now() + 600000,
        }),
      });
      sinon.stub(User, "findOneAndUpdate").resolves();
      const res = await request
        .post("/forgot-password")
        .send({ email: "existing_user@example.com" });
      expect(res.status).to.eql(200);
      expect(res.text).to.include("reset-password");
      expect(res.text).to.include("existing_user@example.com"); // Assuming your reset-password page displays the email
    });

    it("should render forgot-password page with an error when a user is not found by email", async () => {
      sinon.stub(User, "findOne").resolves(null);
      const res = await request
        .post("/forgot-password")
        .send({ email: "non_existing_user@example.com" });

      expect(res.status).to.eql(200);

      expect(res.text).to.include("User not found");
    });

    it("should render forgot-password page with an error when an error occurs", async () => {
      sinon.stub(User, "findOne").throws(new Error("Database error"));

      const res = await request
        .post("/forgot-password")
        .send({ email: "existing_user@example.com" });

      expect(res.status).to.eql(200);

      expect(res.text).to.include(
        "Something went wrong. Please try again later."
      );
    });
  });

  describe("Post /reset-password", () => {
    it("should redirect to login page when OTP verification is successful", async () => {
      sinon.stub(User, "findOne").resolves({
        _id: { $oid: "65cdd90a7073a959dcac5816" },
        Username: "new@gmail",
        Name: "New User",
        password:
          "19d469c9608bd97a0030a9a890a25b8397f600f5cdbd4c6fa4309c500ce7e564",
        profileImageURL: "/images/default.jpg",
        otp: "123456",
        otpExpiration: null,
        save: sinon.stub().resolves(),
        verifyOTP: sinon.stub().returns(true),
      });

      // Send a POST request to the reset-password route with valid data
      const res = await request.post("/reset-password").send({
        email: "new@gmail", // Use the email from the user document
        otp: "123456", // Use a valid OTP
        newPassword: "new_password",
      });

      expect(res.status).to.eql(302);

      expect(res.header.location).to.eql("/login");
    });

    it("should render reset-password page with an error when user is not found by email", async () => {
      // Stub the User model's findOne method to resolve without a user
      sinon.stub(User, "findOne").resolves(null);

      // Send a POST request to the reset-password route with non-existing email
      const res = await request.post("/reset-password").send({
        email: "non_existing_user@example.com",
        otp: "123456",
        newPassword: "new_password",
      });

      // Check if the response status is a 200 (OK)
      expect(res.status).to.eql(200);

      // Check if the response body contains the error message
      expect(res.text).to.include("Invalid OTP. Please try again.");
    });

    it("should render reset-password page with an error when OTP verification fails", async () => {
      // Stub the User model's findOne method to resolve with a user
      sinon.stub(User, "findOne").resolves({ verifyOTP: () => false });

      // Send a POST request to the reset-password route with valid email but invalid OTP
      const res = await request.post("/reset-password").send({
        email: "existing_user@example.com",
        otp: "654321", // Incorrect OTP
        newPassword: "new_password",
      });

      // Check if the response status is a 200 (OK)
      expect(res.status).to.eql(200);

      // Check if the response body contains the error message
      expect(res.text).to.include("Invalid OTP. Please try again.");
    });

    it("should render reset-password page with an error when an error occurs", async () => {
      // Stub the User model's findOne method to throw an error
      sinon.stub(User, "findOne").throws(new Error("Database error"));

      // Send a POST request to the reset-password route
      const res = await request.post("/reset-password").send({
        email: "existing_user@example.com",
        otp: "123456",
        newPassword: "new_password",
      });

      // Check if the response status is a 200 (OK)
      expect(res.status).to.eql(200);

      // Check if the response body contains the error message
      expect(res.text).to.include(
        "Something went wrong. Please try again later."
      );
    });
  });
});
