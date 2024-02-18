const { Router } = require("express");
const User = require("../models/user");
const multer = require("multer");
const { uploadFileToS3 } = require("../services/S3_Upload");
const sendOTP = require("../services/sendOtpMail");
const router = Router();

const upload = multer({ dest: "uploads/" });

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { Username, Name, password } = req.body;

  let profileImageURL = "/images/default.jpg"; // Default profile image URL
  if (req.file) {
    const bucketName = process.env.S3_BUCKET;
    // Upload profile image to S3
    profileImageURL = await uploadFileToS3(bucketName, req.file);
  }

  try {
    await User.create({
      Username,
      Name,
      password,
      profileImageURL,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.render("signup", {
      error: "Username Already Exist",
    });
  }
});

router.post("/login", async (req, res) => {
  const { Username, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(Username, password);
    // console.log("Login Success");
    return res.status(302).cookie("token", token).redirect("/dashboard");
  } catch (error) {
    // console.log("Login Fail",error);
    return res.render("login", {
      error: "Incorrect Username or Password",
    });
  }
});

router.get("/login", (req, res) => {
  return res.render("login");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

router.get("/forgot-password", (req, res) => {
  return res.render("forgot-password");
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ Username: email });
    if (!user) {
      // User not found
      return res.render("forgot-password", {
        error: "User not found",
      });
    }

    // Generate OTP and send it to the user's email
    const { otp, otpExpiration } = user.generateOTP();
    await User.findOneAndUpdate({ Username: email }, { otp, otpExpiration });
    await sendOTP(email, otp);

    return res.render("reset-password", { email }); // Render a page to enter OTP
  } catch (error) {
    console.error("Error in forgot password route:", error);
    return res.render("forgot-password", {
      error: "Something went wrong. Please try again later.",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ Username: email });
    if (!user || !user.verifyOTP(otp)) {
      // User not found or OTP verification failed
      return res.render("reset-password", {
        email,
        error: "Invalid OTP. Please try again.",
      });
    }
    // Reset password
    user.password = newPassword;
    await user.save();
    console.log("Password Changed");
    return res.redirect("/login");
  } catch (error) {
    console.error("Error in reset password route:", error);
    return res.render("reset-password", {
      email,
      error: "Something went wrong. Please try again later.",
    });
  }
});

module.exports = router;
