var express = require('express');
var router = express.Router();
const sql = require('mssql')
var config = require('../config/dbconfig')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const passport = require('passport')

// sql.connect(config.db, function (err) {
//   if (err) console.log(err);
// });

/* GET users listing. */
router.get('/register', function(req, res, next) {
  res.render('register')
});

router.post('/register', (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  let now = moment(Date.now()).format("YYYY-MM-DD hh:mm:ss a")

  if(password !== password2){
    req.flash('error', 'Passwords do not match')
    res.render('register', {err: "Passwords do not Match"}) 
  }

  bcrypt.genSalt(10, (err, salt) =>{
    bcrypt.hash(password, salt, (err, hash)=>{
      if(err) console.log(err)

      var request = new sql.Request();
      request.query(`insert into dbo.[User](username, password, name, email, date_created) 
                     VALUES('${username}', '${hash}', '${name}', '${email}', '${now}')`, function (err, recordset) {
        if (err) {
          console.log(err)
          res.render("register", {err: "Username already exists"})
        } else {
          res.redirect('/');
        }
      });
    })
  })
})

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', (req, res, next) => {
 passport.authenticate('local', {
   successRedirect:'/',
   failureRedirect: '/users/login',
   failureFlash: true
  })(req,res,next);
})

router.get('/logout', (req, res, next) => {
  req.logout();
  req.flash('success', 'You have been logged out')
  res.redirect('/users/login')
})

module.exports = router;
