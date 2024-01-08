const express = require("express");
const routes = express.Router();

// Importing the controller functions
const {
  getProfile,
  updateProfile,
  deleteProfile,
  updateProfilePicture,
} = require("../controllers/profile.controllers.js");
const { isAuthenticated } = require("../middlewares/auth.middlewares.js");

// Routes
routes.get("/profile", getProfile);
routes.put("/profile/update", updateProfile);
routes.delete("/profile/delete", deleteProfile);
routes.put("/updateProfilePicture", isAuthenticated, updateProfilePicture);

module.exports = routes;
