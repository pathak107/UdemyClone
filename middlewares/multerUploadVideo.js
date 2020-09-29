const multer = require('multer');

//Multer storage settings
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './course-videos/'+req.videoFolder)    
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
var uploadVideo = multer({ storage: storage }).array('videoFolder',100);
module.exports=uploadVideo;

//http://localhost:3000/admin/uploadVideo/5f7315d071572645cc5b3c09