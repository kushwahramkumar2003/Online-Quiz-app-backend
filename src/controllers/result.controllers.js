const asyncHandler = require("./../services/asyncHandler.js");
const Result = require("./../models/Result.model.js");



// @desc    Get result by ID
// @route   GET /api/results/:id
// @access  Public
exports.getResultById = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) {
    res.status(404);
    throw new Error("Result not found");
  }
  res.json(result);
});

exports.getAllUserResults = asyncHandler(async (req, res) => {
  const user = req.user;
  const results = await Result.find({ user: user._id });
  console.log(results);

  res.json(results);
});
