const asyncHandler = require("./../services/asyncHandler.js");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");
const config = require("../config/index.js");

// Middleware to check if user is authenticated
const isAuthenticated = asyncHandler(async (req, res, next) => {
  // res.header(
  //   "Access-Control-Allow-Origin",
  //   "https://kushwahramkumar2003.github.io"
  // );
  // res.header("Access-Control-Allow-Credentials", true);

  // console.log("isAuthenticated called");

  let token;
  // console.log("req.cookies : ", req?.cookies);
  // console.log("req.cookies.token : ", req?.cookies?.token);
  if (
    req.cookies.token ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer"))
  ) {
    try {
      // console.log("req.cookies.token ", req.cookies.token);
      token = req.cookies.token || req.headers.authorization.split(" ")[1];

      // console.log("Extracted token : ", token);
      const decoded = await jwt.verify(token, config.JWT_SECRET);
      // console.log("decoded : ", decoded);
      req.user = await User.findById(decoded._id).select("-password");
      // console.log("req.user : ", req.user);
      next();
    } catch (error) {
      console.error(error);
      // console.log("Error message : ", error.message);
      // console.log("Not authorized, token failed");
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    // console.log("Not authorized, no token");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  // res.header(
  //   "Access-Control-Allow-Origin",
  //   "https://kushwahramkumar2003.github.io"
  // );
  // res.header("Access-Control-Allow-Credentials", true);

  // console.log("req.user : ", req);
  if (req.user && req.user.role === "ADMIN") {
    // console.log("req.user : ", req.user);
    next();
  } else {
    // console.log("Not authorized as an admin");
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

module.exports = { isAuthenticated, isAdmin };
