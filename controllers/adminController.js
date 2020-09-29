const Category = require('../models/category');
const Course = require('../models/courses');
exports.get_newCourse_page = (req, res) => {
    Category.find((err, categories) => {
        if (err) {
            return res.render('newCourse', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                message: "Some problem occured with database. Please reload the page",
                categories: []
            });
        }
        return res.render('newCourse', {
            isLogged: req.session.isLogged,
            adminLogged: req.session.adminLogged,
            message: "Enter details to create a new course",
            categories: categories
        });
    })

}
exports.create_newCourse = (req, res) => {
    newCourse = new Course({
        title: req.body.title,
        description: req.body.description,
        category: req.body.categoryID,
        instructor: req.body.instructor,
        aboutInstructor: req.body.aboutInstructor,
        price: req.body.price,
        imageUrl: req.file.filename,
        watchHours: req.body.watchHours,
    })
    newCourse.save((err, course) => {
        if (err) console.log(err)
        res.redirect('/admin/uploadVideo/' + course._id);
    })
}


exports.get_addCategory_page = (req, res) => {
    return res.render('addNewCategory', {
        isLogged: req.session.isLogged,
        adminLogged: req.session.adminLogged,
        message: "Enter the name of new category."
    });
}
exports.create_newCategory = (req, res) => {
    newCategory = new Category({
        name: req.body.category
    })
    newCategory.save((err, category) => {
        if (err) {
            return res.render('addNewCategory', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                message: "Some error occurred while creating the category. Make sure this category doesn't already exists."
            });
        }
        else {
            res.redirect('/admin/newCourse')
        }
    })
}

exports.get_uploadVideo_page = (req, res) => {
    const courseID = req.params.courseID;
    Course.findById(courseID, (err, course) => {
        if (err) {
            return res.render('uploadVideo', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                message: "Some error occurred while creating the course. Retry again.",
                course: null
            });
        }
        return res.render('uploadVideo', {
            isLogged: req.session.isLogged,
            adminLogged: req.session.adminLogged,
            message: "Upload the folder of videos containing the lectures. Naming should be done as 1.mp3, 2.mp4 etc",
            course: course
        });
    })
}

exports.create_uploadVideo = (req, res) => {
    const courseID = req.params.courseID;
    Course.findById(courseID, (err, course) => {
        if (err) {
            return res.render('uploadVideo', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                message: "Some error occurred while creating the course. Can't fint the course",
                course: null
            });
        }
        course.videoUrl = req.videoFolder;
        course.save();
        res.redirect('/courses')
    })
}


exports.get_adminLogin_page = (req, res) => {
    res.render('adminLogin', {
        isLogged: req.session.isLogged,
        adminLogged: req.session.adminLogged,
        message: "Enter details to login."
    });
}

exports.admin_login = (req, res) => {
    if (req.body.username == process.env.ADMIN_USER && req.body.password == process.env.ADMIN_PASS) {
        req.session.adminLogged = true
        res.redirect('/admin/newCourse');
    } else {
        return res.render('adminLogin', {
            isLogged: req.session.isLogged,
            adminLogged: req.session.adminLogged,
            message: "User Name or password entered is incorrect."
        })
    }
}

exports.admin_logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        console.log('logged out');
        res.redirect('/');
    })
}