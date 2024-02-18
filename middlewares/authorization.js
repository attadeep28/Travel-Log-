const { redirect } = require("express"); // Import redirect function from Express
const { validateToken } = require("../services/authentication");
const secret = "$uperMan@123";
const tokenExpiration = "3h";
const JWT = require("jsonwebtoken");

function loginRequired(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return res.status(401).redirect("/login"); // Change redirect to res.redirect
    }
    try {
      const userPayload = JWT.verify(tokenCookieValue, secret);
      req.user = userPayload;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(500).redirect("/login"); // Change redirect to res.redirect
    }
  };
}

module.exports = {
  loginRequired,
};
