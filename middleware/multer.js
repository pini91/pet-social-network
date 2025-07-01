const multer = require("multer"); // multer is a pretty substantial package that weve had to install
const path = require("path");

module.exports = multer({ //All of this is just bits of code.
  storage: multer.diskStorage({}), // we are not storing it in our disk locally, so we kinda keep this empty.
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") { // here we are cheking which type of file it is .jpg or any of the other we are limiting to(for example with a .svg it wouldnt work). You can change this to different stuff. You probably have to check with your media provider to see if it supports the media that you are gonna allow folks to upload. sor for example ask cloudinary(read the documentary) can i uploas svgs, MP3s gifs.
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});
