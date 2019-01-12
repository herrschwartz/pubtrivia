var express = require('express');
var router = express.Router();
const sql = require('mssql')
var moment = require('moment');
var config = require('../config/dbconfig')


sql.connect(config.db, function (err) {
  if (err) console.log(err);
});

router.get('/', function (req, res) {
  var request = new sql.Request();
  request.query('select * from dbo.questions', function (err, recordset) {
    if (err) console.log(err)
    res.render('index', { title: "Question List", 'qs': recordset.recordset});
  });
});

router.get('/question/get/:qid', function(req, res, next){
  let qid = req.params.qid
  var request = new sql.Request();
  request.query(`select * from dbo.questions where id=${qid}`, function (err, recordset) {
    if (err) console.log(err)
    console.log(recordset.recordset[0])
    res.render('question_display', {'qs': recordset.recordset[0]});
  });
})

router.get('/question/add', function(req, res, next){
  res.render('add_question', {})
})

router.post('/question/add/', function(req, res, next){
  const question = req.body.question;
  const answer = req.body.answer;
  const date = moment(req.body.date).format("YYYY/MM/DD");
  const round = req.body.round;
  let correct = 0;
  if(req.body.correct == "correct") correct = 1;
  console.log(date)
  console.log(moment(Date.now()).format("YYYY-MM-DDTHH:MM:SS"))

  var request = new sql.Request();
  request.query(`INSERT INTO questions (question, answer, date, round, correct, date_created)
                 VALUES ('${question}', '${answer}', '${date}', ${round}, ${correct}, '${moment(Date.now()).format("YYYY-MM-DDTHH:MM:SS")}')`, 
  function (err, recordset) {
    if (err) {
      console.log(err)
      res.render('add_question', { err: "Error, failed to insert"});
    } else {
      res.redirect('/question/add')
    }
  });
})


module.exports = router;

