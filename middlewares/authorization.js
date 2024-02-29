require("dotenv").config();
const { verify } = require("jsonwebtoken");

function loginRequired(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return res.status(401).redirect("/login"); // Change redirect to res.redirect
    }
    try {
      const userPayload = verify(tokenCookieValue, process.env.secret);
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
