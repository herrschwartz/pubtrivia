var express = require('express');
var router = express.Router();
const sql = require('mssql')
var config = require('../config/dbconfig')
const bcrypt = require('bcryptjs')
const moment = require('moment')

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
  let now = moment(Date.now()).format("YYYY-MM-DD hh:mm:ss a")

  bcrypt.genSalt(10, (err, salt) =>{
    bcrypt.hash(password, salt, (err, hash)=>{
      if(err) console.log(err)

      var request = new sql.Request();
      request.query(`insert into dbo.[User](username, password, name, email, date_created) 
                     VALUES('${username}', '${hash}', '${name}', '${email}', '${now}')`, function (err, recordset) {
        if (err) console.log(err)
        res.redirect('/users/login');
      });
    })
  })
})

router.get('/login', (req, res) => {
  res.render('login')
})

module.exports = router;
