const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = {
      username: decodedToken.username,
      isAdmin: decodedToken.isAdmin
    };
    next();
  } catch (error) {
    next();
    //res.status(401).json({ message: "Authentication failed. Please log in." });
  }
};