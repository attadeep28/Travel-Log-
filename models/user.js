const { createHmac, randomBytes } = require("crypto");
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema(
  {
    Username: {
      type: String,
      required: true,
      unique: true,
    },
    Name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
    },

    profileImageURL: {
      type: String,
      default: "/images/default.jpg",
    },
    otp: {
      type: String,
      default: "",
    },
    otpExpiration: {
      type: Date,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;

  next();
});

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (Username, password) {
    const user = await this.findOne({ Username });
    if (!user) throw new Error("User not found!");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== userProvidedHash)
      throw new Error("Incorrect Password");

    const token = createTokenForUser(user);
    return token;
  }
);

userSchema.methods.generateOTP = function () {
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
  return { otp, otpExpiration };
};

userSchema.methods.verifyOTP = function (otp) {
  return this.otp === otp && this.otpExpiration > Date.now();
};

const User = model("user", userSchema);

module.exports = User;
