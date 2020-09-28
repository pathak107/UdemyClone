module.exports = (req, res, next) => {
    if((req.session.isLogged!=null ||req.session.isLogged!=undefined)&&req.session.isLogged==true){
        console.log('logged in');
        next()
    }
    else{
        res.redirect('/login');
    }
}