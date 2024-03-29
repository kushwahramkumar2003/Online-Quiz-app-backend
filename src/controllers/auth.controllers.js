const asyncHandler = require("./../services/asyncHandler.js");
const User = require("../models/User.model.js");
const { validationResult } = require("express-validator");

const cookieOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  sameSite: "None",
  secure: true,
};

/********************************
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 * @param   {String} name
 *********************************/
exports.signup = asyncHandler(async (req, res) => {
  console.log("req.body", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return res.status(400).json({ msg: "User already exists" });
  }
  user = new User({
    name,
    email,
    password,
  });
  await user.save();

  user.password = undefined;
  const token = user.generateToken();
  res.cookie = ("token", token, cookieOptions);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: user,
  });
});

/***************************************
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 * @param   {String} email
 * @param   {String} password
 * @returns {Object} User
 ***************************************/
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne(
    { email },
    { email: 1, password: 1, name: 1, role: 1, avatar: 1 }
  );
  // console.log("user", user);
  if (!user) {
    return res.status(400).json({ msg: "Invalid Credentials" });
  }

  const isMatch = await user.comparePassword(password);

  // console.log("isMatch", isMatch);

  if (!isMatch) {
    return res.status(400).json({ msg: "Invalid Credentials" });
  }

  const token = user.generateToken();
  user.token = token;

  res.cookie("token", token, cookieOptions);
  res.cookie("res token : ", token);

  // console.log("res : ", res);

  console.log("Login token : ", token);

  user.password = undefined;
  res.user = user;
  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user,
  });
});

/**************************************
 * @desc    Logout user
 * @route   GET /api/auth/logout
 * @access  Private
 * @returns {Object} Message
 **************************************/
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out successfully" });
});

/**************************************
 * @desc    Get user details
 * @route   GET /api/auth/me
 * @access  Private
 * @returns {Object} User
 * **************************************/

exports.getAdminDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    _id: user._id,
    avatar: user.avatar,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

/**************************************
 * @desc    Update user details
 * @route   PUT /api/auth/me
 * @access  Private
 * @param   {String} name
 * @param   {String} email
 * @param   {String} password
 * @returns {Object} User
 * **************************************/
exports.updateAdminDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;

  if (req.body.password && req.body.password.length < 6) {
    res.status(400).json({
      success: false,
      message: "Password should be minimum 6 characters",
    });
    return;
  } else if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  updatedUser.password = undefined;

  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});
