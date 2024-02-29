require("dotenv").config();
const { sign, verify } = require("jsonwebtoken");
const secret = process.env.secret;
const tokenExpiration = "3h";

function createTokenForUser(user) {
  console.log(user);
  const payload = {
    _id: user._id,
    username: user.Username,
    profileImageURL: user.profileImageURL,
  };
  const token = sign(payload, secret, { expiresIn: tokenExpiration });
  return token;
}

function validateToken(token) {
  const payload = verify(token, secret);
  return payload;
}

module.exports = {
  createTokenForUser,
  validateToken,
};
