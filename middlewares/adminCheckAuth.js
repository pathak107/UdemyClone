module.exports = (req, res, next) => {
    if((req.session.adminLogged!=null ||req.session.adminLogged!=undefined)&&req.session.adminLogged==true){
        console.log('Admin logged in');
        next()
    }
    else{
        res.redirect('/admin/login');
    }
}