const cloudinary = require("cloudinary");
const config = require("../config/index.js");

const cloudnairyconnect = () => {
  try {
    cloudinary.v2.config({
      cloud_name: config.CLOUD_NAME,
      api_key: config.API_KEY,
      api_secret: config.API_SECRET,
    });
    console.log("CD connected");
  } catch (error) {
    console.log("error connecting CD" + error);
  }
};

module.exports = cloudnairyconnect;
