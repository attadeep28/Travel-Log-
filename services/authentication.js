const JWT = require("jsonwebtoken");

const secret = "$uperMan@123";
const tokenExpiration = "3h";

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    Username: user.Username,
    profileImageURL: user.profileImageURL,
  };
  const token = JWT.sign(payload, secret, { expiresIn: tokenExpiration });
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}

module.exports = {
  createTokenForUser,
  validateToken,
};
