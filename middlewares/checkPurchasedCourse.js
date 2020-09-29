const User = require('../models/user');

module.exports = async (req, res, next) => {
    const courseID = req.params.courseID;
    user = await User.findById(req.session.user_id);
    var purchasedCourse = user.purchasedCourse;
    var alreadyPurchased = false;
    for (let i = 0; i < purchasedCourse.length; i++) {
        if (purchasedCourse[i].toString() == courseID.toString()) {
            alreadyPurchased = true;
        }
    }

    if (alreadyPurchased) {
        next();
    } else {
        res.redirect('/checkout/' + courseID)
    }
}

