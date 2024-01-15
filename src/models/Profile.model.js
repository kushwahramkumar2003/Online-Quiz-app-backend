const mongoose = require("mongoose");
const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  Birthday: {
    type: Date,
  },
  Phone: {
    type: String,
    trim: true,
  },
  Address: {
    type: String,
    trim: true,
  },
  City: {
    type: String,
    trim: true,
  },
  State: {
    type: String,
    trim: true,
  },
  Zip: {
    type: String,
    trim: true,
  },
  Country: {
    type: String,
    trim: true,
  },
  Institute: {
    type: String,
    trim: true,
  },
  Education: {
    type: String,
    trim: true,
  },
  Skills: {
    type: String,
    trim: true,
  },
  Languages: {
    type: String,
    trim: true,
  },

});

// Delete the user before deleting the profile
profileSchema.pre("deleteOne", { document: true }, async function (next) {
  const profile = this;
  await User.deleteOne({ _id: profile.user });
  next();
});

// Log the profile details after saving
profileSchema.post("save", function (doc, next) {
  console.log("Profile saved:", doc);
  next();
});

// Find the profile by user id
profileSchema.statics.findByUserId = async function (user) {
  const profile = await Profile.findOne({ user });
  return profile;
};

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
