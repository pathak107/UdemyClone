const path=require('path')
const fs=require('fs')

module.exports = (req, res, next) => {
    const uniqueName=(new Date().getTime() + "-" + 'Course')
    var dir = path.join(__dirname, '../course-videos',uniqueName )
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      req.videoFolder = uniqueName
    }
    next()
}