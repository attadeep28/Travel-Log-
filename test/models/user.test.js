const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const { randomBytes, createHmac } = require("crypto");
const User = require("../../models/user");
const connect = require("../../services/connectToDb");
const mongoose = require("mongoose");

describe("User Model", () => {
  describe("matchPasswordAndGenerateToken static method", () => {
    it("should throw an error if user is not found", async () => {
      sinon.stub(User, "findOne").resolves(null);

      try {
        await User.matchPasswordAndGenerateToken(
          "nonexistent_user",
          "password123"
        );
      } catch (error) {
        expect(error.message).to.equal("User not found!");
      }

      sinon.restore();
    });

    it("should throw an error if password is incorrect", async () => {
      const user = new User({
        Username: "test_user",
        Name: "Test User",
        password: "password123",
        salt: randomBytes(16).toString("hex"),
      });
      sinon.stub(User, "findOne").resolves(user);

      try {
        await User.matchPasswordAndGenerateToken("test_user", "wrong_password");
      } catch (error) {
        expect(error.message).to.equal("Incorrect Password");
      }

      sinon.restore();
    });

    it("should return a token if password is correct", async () => {
      let salt = randomBytes(16).toString("hex");
      const user = new User({
        Username: "test_user",
        Name: "Test User",
        salt: salt,
        password: createHmac("sha256", salt)
          .update("password123")
          .digest("hex"),
      });
      sinon.stub(User, "findOne").resolves(user);
      const token = await User.matchPasswordAndGenerateToken(
        "test_user",
        "password123"
      );

      expect(token).not.to.be.null;

      sinon.restore();
    });
  });

  describe("generateOTP method", () => {
    it("should generate a 6-digit OTP and set expiration time", () => {
      const user = new User({
        Username: "test_user",
        Name: "Test User",
      });

      const { otp, otpExpiration } = user.generateOTP();

      expect(otp).to.be.a("string").and.to.have.lengthOf(6);
      expect(otpExpiration).to.be.a("Date").and.to.be.greaterThan(new Date());
    });
  });

  describe("verifyOTP method", () => {
    it("should return true if OTP matches and has not expired", () => {
      const user = new User({
        Username: "test_user",
        Name: "Test User",
        otp: "123456",
        otpExpiration: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes in the future
      });

      const isVerified = user.verifyOTP("123456");

      expect(isVerified).to.be.true;
    });

    it("should return false if OTP does not match", () => {
      const user = new User({
        Username: "test_user",
        Name: "Test User",
        otp: "123456",
        otpExpiration: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes in the future
      });

      const isVerified = user.verifyOTP("654321");

      expect(isVerified).to.be.false;
    });

    it("should return false if OTP has expired", () => {
      const user = new User({
        Username: "test_user",
        Name: "Test User",
        otp: "123456",
        otpExpiration: new Date(Date.now() - 1000), // 1 second in the past
      });

      const isVerified = user.verifyOTP("123456");

      expect(isVerified).to.be.false;
    });
  });

  describe("pre save hook", () => {
    beforeEach(async () => {
      await connect(true);
      await User.deleteMany({});
    });
    afterEach(async ()=>{
      
      await mongoose.disconnect();
    })
    it("should hash the password and set salt before saving", async () => {
      const user = new User({
        Username: "test_user",
        Name: "Test User",
        password: "password123",
      });
      //   sinon.stub(user, "save");
      await user.save();
      expect(user.password).not.eql("password123");
    });
  });
});
