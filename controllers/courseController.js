const Category = require('../models/category');
const Course = require('../models/courses');
const Comment = require('../models/comments')
const mongoose = require('mongoose');
const User = require('../models/user');
const Razorpay = require('razorpay');
const Transaction = require('../models/transactions');
const path = require('path');
const fs = require('fs');

//razorpay instance initialization
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

exports.get_all_courses = async (req, res) => {
    var categories = await Category.find();
    Course.find((err, courses) => {
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
    }).select('-description -aboutInstructor')
}

exports.get_courses_of_category = async (req, res) => {
    if (req.body.category != undefined) {
        query = { category: mongoose.Types.ObjectId(req.body.category) }
    } else {
        query = {};
    }
    console.log(req.body.category)
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
    }).select('-description -aboutInstructor')
}


exports.get_single_course = async (req, res) => {
    const courseID = mongoose.Types.ObjectId(req.params.courseID.toString());
    var mostLikedCourses = await Course.find()
        .limit(4)
        .select('-description')
        .sort({ likes: 'desc' });

    var comments = await Comment.find({ courseID: courseID })
        .populate('userID')
        .sort({ timestamp: 'desc' });

    var user;
    if ((req.session.isLogged != null || req.session.isLogged != undefined) && req.session.isLogged == true) {
        user = await User.findById(req.session.user_id);
        var purchasedCourse = user.purchasedCourse;
        var alreadyPurchased = false;
        for (let i = 0; i < purchasedCourse.length; i++) {
            if (purchasedCourse[i].toString() == req.params.courseID.toString()) {
                alreadyPurchased = true;
            }
        }
    }


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
                userID: req.session.user_id ? req.session.user_id : "",
                alreadyPurchased: alreadyPurchased
            });
        }
    })

}

exports.get_home_page = async (req, res) => {
    var recentCourses = await Course.find()
        .limit(4)
        .select('-description -aboutInstructor')
        .sort({ timestamp: 'desc' });
    var mostLikedCourses = await Course.find()
        .limit(4)
        .select('-description -aboutInstructor')
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
    User.findById(req.session.user_id, (err, user) => {
        if (err) console.log(err)
        var purchasedCourseIds = user.purchasedCourse;
        Course.find({ '_id': { $in: purchasedCourseIds } }, (err, courses) => {
            if (err) console.log(err)
            return res.render('myCourses', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                courses: courses
            })
        }).select('-description -aboutInstructor')
    })
}


exports.verify_payment = async (req, res) => {
    const user = await User.findById(req.session.user_id);
    const courseID = req.params.courseID;
    var signature = req.body.razorpay_signature;

    //validating the signature
    const crypto = require('crypto');
    var generated_signature = crypto.createHmac('SHA256', process.env.RAZORPAY_SECRET)
        .update(req.body.order_id + "|" + req.body.razorpay_payment_id)
        .digest('hex');
    console.log(generated_signature)
    console.log(signature)
    if (generated_signature == signature) {
        console.log("payment is successful")
        //Add courseID in purchased courses of user
        user.purchasedCourse.push(courseID.toString())
        user.save((err, user) => {
            if (err) {
                console.log(err);
                //initiate refund
            }

            //create a new transaction to keep records
            const newTrans = Transaction({
                amount: req.body.amount,
                courseID: courseID,
                userID: user._id,
                razorpay_payment_id: req.body.razorpay_payment_id,
                razorpay_order_id: req.body.order_id
            })
            newTrans.save();

            //increasing the number of enrolled people in courses
            Course.findById(courseID, (err, course) => {
                course.enrolledUsers = course.enrolledUsers + 1;
                course.save();
            }).select('-description -aboutInstructor')

        })

        res.redirect('/myCourses');
    } else {
        console.log('payment failed');
        res.redirect('/checkout/' + courseID)
    }
}

exports.get_checkout_page = async (req, res) => {
    const user = await User.findById(req.session.user_id);
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

        //razor pay order id
        var options = {
            amount: course.price * 100,  // amount in the smallest currency unit
            currency: "INR",
        };
        instance.orders.create(options, function (err, order) {
            console.log(order);
            return res.render('checkout', {
                userName: user.name,
                amount: course.price,
                userEmail: user.email,
                order_id: order.id,
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                message: "Select wide range of online payment options using Razorpay.(UPI/ Net Banking/ Credit Card/ Debit Card/ External Wallets",
                course: course
            })
        });
    }).select('-description -aboutInstructor')
}

exports.like_update = async (req, res) => {
    const courseID = req.params.courseID;
    user = await User.findById(req.session.user_id);
    const x = await User.aggregate([{ $match: { _id: req.session.user_id } }, { $project: { courses: { $size: '$courses' } } }])
    var likedCourses = (user.likedCourses != [null]) ? user.likedCourses : [];
    var alreadyLiked = false;
    console.log(x);
    for (let i = 0; i < likedCourses.length; i++) {
        if (likedCourses[i].toString() == courseID.toString()) {
            alreadyLiked = true;
        }
    }
    if (!alreadyLiked) {
        user.likedCourses.push(courseID);
        user.save(() => {
            return res.redirect('myCourses');
        });
    }
}

exports.get_watchCourse_page = async (req, res) => {
    var trackNum =req.query.trackNum?req.query.trackNum:0;
    console.log(trackNum)
    Course.findById(req.params.courseID, (err, course) => {
        const directoryPath = path.join(__dirname, '../course-videos', course.videoUrl);
        //passsing directoryPath and callback function
        var courseTracks = []
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            //listing all files using forEach
            files.forEach(function (file) {
                courseTracks.push(file.toString());
            });


            return res.render('watchCourse', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                courseID: req.params.courseID,
                path: path.join(directoryPath,courseTracks[trackNum]),
                imageUrl: course.imageUrl,
                trackNum:trackNum,
                courseTracks: courseTracks
            });
        });


    })

}

exports.create_comment = (req, res) => {
    const courseID = req.params.courseID
    const newComment = Comment({
        comment: req.body.comment,
        courseID: courseID,
        userID: req.session.user_id
    })
    newComment.save(() => {
        res.redirect('/courseSingle/' + courseID)
    })
}

exports.delete_comment = (req, res) => {
    const commentID = req.params.commentID;
    Comment.findById(commentID, (err, comment) => {
        comment.remove();
        res.redirect('/courses')
    })
}