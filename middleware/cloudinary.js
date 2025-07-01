const cloudinary = require("cloudinary").v2;// we are using this npm package

require("dotenv").config({ path: "./config/.env" });

cloudinary.config({ // this are all the stuff we need to connect to cloudinary, and all this things are stored in our .env file.
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

module.exports = cloudinary;
