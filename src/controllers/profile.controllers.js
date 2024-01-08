const asyncHandler = require("./../services/asyncHandler.js");
const Profile = require("../models/Profile.model.js");
const uploadImageToCloudinary = require("../utils/imageUploder.js");
const User = require("../models/User.model.js");
const config = require("../config/index.js");

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });
  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }
  res.json(profile);
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });
  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }
  profile.name = req.body.name || profile.name;
  profile.email = req.body.email || profile.email;
  profile.bio = req.body.bio || profile.bio;
  const updatedProfile = await profile.save();
  res.json(updatedProfile);
});

// @desc    Delete user profile
// @route   DELETE /api/profile
// @access  Private
exports.deleteProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });
  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }
  await profile.remove();
  res.json({ message: "Profile removed" });
});

exports.updateProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  if (req.files && req.files.profilePicture) {
    const img = req.files.profilePicture;

    if (!img) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    let uploadDetails = await uploadImageToCloudinary(img, config.FOLDER_NAME);
    console.log("upload details : " + uploadDetails);

    user.avatar = uploadDetails.secure_url;

    const updatedUser = await user.save();

    res.json({
      success: true,
      user,
    });
  } else {
    user.avatar = null;
    const updatedUser = await user.save();

    console.log("updatedUser : ", updatedUser);

    res.json({
      success: true,
      user,
    });
  }
});
