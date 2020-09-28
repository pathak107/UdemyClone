const multer = require('multer');

//Multer storage settings
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/course-videos')    
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime()+"-"+file.originalname);
  }
})
var uploadVideo = multer({ storage: storage })
module.exports=uploadVideo;