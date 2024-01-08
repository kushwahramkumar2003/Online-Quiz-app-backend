// Initialize express router
const express = require("express");
const routes = express.Router();
const {
  signup,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  getAdminDetails,
  updateAdminDetails,
} = require("../controllers/auth.controllers.js");

const {
  isAuthenticated,
  isAdmin,
} = require("../middlewares/auth.middlewares.js");

// Register a new user
routes.post("/register", signup);

// User login
routes.post("/login", login);

// Logout the user
routes.get("/logout", isAuthenticated, logout);

routes.get("/getAdminDetails", isAuthenticated, isAdmin, getAdminDetails);

routes.put("/updateAdminDetails", isAuthenticated, isAdmin, updateAdminDetails);

module.exports = routes;
