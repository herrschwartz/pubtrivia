const LocalStrategy = require("passport-local").Strategy;
//const config = require("../config/database")
const bcrypt = require('bcryptjs');
const sql = require('mssql')

module.exports = function(passport) {
    passport.use(new LocalStrategy((username, password, done) => {
        let query = `SELECT id, username, password FROM dbo.[user] WHERE username = '${username}'`
        var request = new sql.Request();
        request.query(query, function (err, recordset) {
            if (err) console.log(err)
            
            if(recordset.rowsAffected[0] == 0){
                return done(null, false, {msg: 'Username does not exist'})
            }

            bcrypt.compare(password, recordset.recordset[0].password, (err, isMatch) => {
                if(err) console.log(err);

                if(isMatch){
                    return done(null, recordset.recordset[0])
                } else {
                    return done(null, false, {msg: "incorrect password", message: "wrong password"})
                }
            })
        }); 
    }))
    passport.serializeUser( (user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser( (id,done) =>{
        let query = `SELECT * FROM dbo.[user] WHERE id = ${id}`
        var request = new sql.Request();
        request.query(query, function (err, recordset) {
            done(err, recordset.recordset[0])
        })
    })
}