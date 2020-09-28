const multer = require('multer');

//Multer storage settings
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/course-thumbnail')    
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime()+"-"+file.originalname);
  }
})
var uploadImage = multer({ storage: storage })
module.exports=uploadImage;