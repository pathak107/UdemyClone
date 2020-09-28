const Category = require('../models/category');
const Course = require('../models/courses');
const Comment = require('../models/comments')
const mongoose = require('mongoose');

exports.get_all_courses = async (req, res) => {
    let page = +req.query.page || 1;
    let query;
    if (req.query.category != undefined) {
        query = { category: mongoose.Types.ObjectId(req.query.category) }
    } else {
        query = {};
    }
    var categories = await Category.find();
    Course.find(query, (err, courses) => {
        let message;
        if (courses.length >= 0) {
            message = "Courses offered"
        }
        else {
            message = "Sorry! There are no courses in this category."
        }
        res.render('courses', {
            isLogged: req.session.isLogged,
            adminLogged: req.session.adminLogged,
            message: message,
            courses: courses,
            categories: categories
        });
    }).select('-description')
}


exports.get_single_course = async (req, res) => {
    const courseID = mongoose.Types.ObjectId(req.params.courseID.toString());
    console.log(courseID)
    var mostLikedCourses = await Course.find()
        .limit(4)
        .select('-description')
        .sort({ likes: 'desc' });

    var comments = await Comment.find({ courseID: courseID })
        .sort({ timestamp: 'desc' });

    Course.findById(courseID, (err, course) => {
        if (err) {
            console.log(err)
        }
        else {
            return res.render('course-single', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                course: course,
                mostLikedCourses: mostLikedCourses,
                comments: comments,
                userID: req.session.userID ? req.session.userID : ""
            });
        }
    })

}

exports.get_home_page = async (req, res) => {
    var recentCourses = await Course.find()
        .limit(4)
        .select('-description')
        .sort({ timestamp: 'desc' });
    var mostLikedCourses = await Course.find()
        .limit(4)
        .select('-description')
        .sort({ likes: 'desc' });
    var categories = await Category.find();

    res.render('index', {
        isLogged: req.session.isLogged,
        adminLogged: req.session.adminLogged,
        recentCourses: recentCourses,
        mostLikedCourses: mostLikedCourses,
        categories: categories
    })
}

exports.get_myCourses_page = (req, res) => {
    res.render('myCourses', {
        isLogged: req.session.isLogged,
        adminLogged: req.session.adminLogged,
    })
}

exports.get_courseWatch_page = (req, res) => {
    res.render('courseWatch', {
        isLogged: req.session.isLogged,
        adminLogged: req.session.adminLogged,
    })
}

exports.get_checkout_page = (req, res) => {
    const courseID = req.params.courseID;
    Course.findById(courseID, (err, course) => {
        if (err) {
            return res.render('checkout', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                message: "Some error occured. Please try again.",
                course: null
            })
        }
        return res.render('checkout', {
            isLogged: req.session.isLogged,
            adminLogged: req.session.adminLogged,
            message: "Select wide range of online payment options using Razorpay.(UPI/ Net Banking/ Credit Card/ Debit Card/ External Wallets",
            course: course
        })
    })

}