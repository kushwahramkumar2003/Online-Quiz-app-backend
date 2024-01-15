const express = require("express");
const routes = express.Router();

// Importing the controller functions
const {
  getProfile,
  updateProfile,
  deleteProfile,
  updateProfilePicture,
} = require("../controllers/profile.controllers.js");

// Routes
routes.get("/", getProfile);
routes.put("/", updateProfile);
// routes.delete("/profile/delete", deleteProfile);
routes.put("/updateProfilePicture", updateProfilePicture);

module.exports = routes;
