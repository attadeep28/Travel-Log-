const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
    
      res.locals.user = userPayload;
      req.user = userPayload;
    } catch (error) {
      console.error(error);
    }

    return next();
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
