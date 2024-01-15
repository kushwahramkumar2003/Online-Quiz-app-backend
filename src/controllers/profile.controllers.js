const asyncHandler = require("./../services/asyncHandler.js");
const Profile = require("../models/Profile.model.js");
const uploadImageToCloudinary = require("../utils/imageUploder.js");
const User = require("../models/User.model.js");
const config = require("../config/index.js");

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  let profile = await Profile.findOne({ user: req.user._id });
  if (!profile) {
    profile = await Profile.create({
      user: req.user._id,
      bio: "",
      Birthday: "",
      Phone: "",
      Address: "",
      City: "",
      State: "",
      Zip: "",
      Country: "",
      Institute: "",
      Education: "",
      Skills: "",
      Languages: "",
    });

    await profile.save();
  }

  res.status(200).json({
    success: true,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: profile.bio,
    Birthday: profile.Birthday,
    Phone: profile.Phone,
    Address: profile.Address,
    City: profile.City,
    State: profile.State,
    Zip: profile.Zip,
    Country: profile.Country,
    Institute: profile.Institute,
    Education: profile.Education,
    Skills: profile.Skills,
    Languages: profile.Languages,
  });
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  console.log("Update profile called");

  console.log("req.body : ", req.body);

  const profile = await Profile.findOne({ user: req.user._id });
  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }
  // profile.name = req.body.name || profile.name;
  // profile.email = req.body.email || profile.email;

  profile.bio = req.body.bio || profile.bio;
  profile.Birthday = req.body.Birthday || profile.Birthday;
  profile.Phone = req.body.Phone || profile.Phone;
  profile.Address = req.body.Address || profile.Address;
  profile.City = req.body.City || profile.City;
  profile.State = req.body.State || profile.State;
  profile.Zip = req.body.Zip || profile.Zip;
  profile.Country = req.body.Country || profile.Country;
  profile.Institute = req.body.Institute || profile.Institute;
  profile.Education = req.body.Education || profile.Education;
  profile.Skills = req.body.Skills || profile.Skills;
  profile.Languages = req.body.Languages || profile.Languages;

  const updatedProfile = await profile.save({ new: true });

  console.log("updatedProfile : ", updatedProfile);

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
