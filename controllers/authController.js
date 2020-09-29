const User = require('../models/user');
const bcrypt = require('bcrypt');
const Transaction = require('../models/transactions');
const transactions = require('../models/transactions');
const saltRounds = 10;

exports.register_page_get = (req, res) => {
    res.render('register', {
        isLogged: req.session.isLogged,
        adminLogged: req.session.adminLogged,
        message: "Please enter all the genuine credentials as these will be used to contact you for prize money."
    });
}

exports.register_user = (req, res) => {
    console.log(req.body);
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            console.log(err)
            return res.render('register', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                message: "Some error occured in registration. Please try again later."
            })
        }
        if (user) {
            return res.render('register', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                message: "You are already registered with that email and registration number."
            })
        } else {
            bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash
                })
                newUser.save((err, newUser) => {
                    if (err) {
                        console.log(err)
                        return res.render('register', {
                            isLogged: req.session.isLogged,
                            adminLogged: req.session.adminLogged,
                            message: "Some error occured in registration. Please try again later."
                        })
                    }

                    //new user created
                    req.session.user_id = newUser._id;
                    req.session.isLogged = true;

                    res.redirect('/')
                })
            });
        }
    })
}

exports.login_page_get = (req, res) => {
    res.render('login', {
        isLogged: req.session.isLogged,
        adminLogged: req.session.adminLogged,
        message: "Enter details to login."
    });
}

exports.login_user = (req, res) => {
    console.log(req.body);
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            console.log(err)
            return res.render('login', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                message: "Some error occured in login. Please try again later."
            })
        }
        if (!user) {
            return res.render('login', {
                isLogged: req.session.isLogged,
                adminLogged: req.session.adminLogged,
                message: "There is no user with that email."
            })
        } else {
            bcrypt.compare(req.body.password, user.password, function (err, result) {
                if (result == true) {
                    //user authenticated
                    req.session.user_id = user._id;
                    req.session.isLogged = true

                    res.redirect('/');

                }
                else {
                    return res.render('login', {
                        isLogged: req.session.isLogged,
                        adminLogged: req.session.adminLogged,
                        message: "Email or password entered is incorrect."
                    })
                }
            });

        }
    })
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        console.log('logged out');
        res.redirect('/');
    })
}


exports.get_transaction_page = (req, res) => {
    Transaction.find({userID:req.session.user_id},(err,transactions)=>{
        if(err) console.log(err)

        res.render('transaction', {
            isLogged: req.session.isLogged,
            adminLogged: req.session.adminLogged,
            transactions:transactions
        })
    })
    .populate('courseID','-description -aboutInstructor')
    
}