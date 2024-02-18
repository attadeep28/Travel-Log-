require("dotenv").config();

const nodemailer = require("nodemailer");

async function sendOTP(email, otp) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: true,
    port: 465,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP",
    text: `Your one-time (OTP) for password change is: ${otp}`,
  };

  let info = await transporter.sendMail(mailOptions);

  console.log("Email sent: " + info.response);

  return otp;
}

module.exports = sendOTP;
