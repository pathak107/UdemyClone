var express = require('express')
var router = express.Router()



//importing controllers
const courseController=require('../controllers/courseController')
const authController=require('../controllers/authController')
const adminController=require('../controllers/adminController')

//importing middlewares
const checkAuth=require('../middlewares/checkAuth')
const adminCheckAuth=require('../middlewares/adminCheckAuth')
const uploadImage=require('../middlewares/multerUploadImage')
const uploadVideo=require('../middlewares/multerUploadVideo')
const checkPurchasedCourse=require('../middlewares/checkPurchasedCourse')
const videoController=require('../controllers/videoController')
const setFolderName=require('../middlewares/setFolderName')

//Auth routes
router.get('/login',authController.login_page_get)
router.post('/login',authController.login_user)
router.get('/logout',authController.logout)
router.get('/register',authController.register_page_get)
router.post('/register',authController.register_user)
router.get('/transaction',checkAuth,authController.get_transaction_page)

//Admin routes
//Serving Static files
router.use('/admin/',express.static('public'));
router.get('/admin/login', adminController.get_adminLogin_page)
router.post('/admin/login',adminController.admin_login)
router.get('/admin/logout',adminController.admin_logout)
router.get('/admin/newCourse',adminCheckAuth,adminController.get_newCourse_page)
router.post('/admin/newCourse',adminCheckAuth,uploadImage.single('img'),adminController.create_newCourse)
router.get('/admin/addCategory',adminCheckAuth,adminController.get_addCategory_page);
router.post('/admin/addCategory',adminCheckAuth,adminController.create_newCategory)
router.get('/admin/uploadVideo/:courseID',adminCheckAuth,adminController.get_uploadVideo_page)
router.post('/admin/uploadVideo/:courseID',adminCheckAuth,setFolderName,uploadVideo,adminController.create_uploadVideo)

// Home Routes
router.get('/',courseController.get_home_page)

//courses and course-single
router.use('/courses/',express.static('public'));
router.get('/courses',courseController.get_all_courses)
router.post('/courses',courseController.get_courses_of_category)
router.get('/courseSingle/:courseID',courseController.get_single_course);

//course watch and my courses
//user needs to be logged in for watching their courses
router.get('/myCourses',checkAuth,courseController.get_myCourses_page)
router.get('/likeUpdate/:courseID',checkAuth,courseController.like_update)
router.get('/checkout/:courseID',checkAuth,courseController.get_checkout_page)
router.post('/checkout/:courseID',courseController.verify_payment)

router.get('/watchCourse/:courseID',checkAuth,checkPurchasedCourse,courseController.get_watchCourse_page);
router.post('/comment/:courseID',checkAuth,checkPurchasedCourse,courseController.create_comment);
router.get('/comment/delete/:commentID',checkAuth,courseController.delete_comment)
router.get('/video/:courseID',checkAuth,checkPurchasedCourse,videoController.get_video)


module.exports = router