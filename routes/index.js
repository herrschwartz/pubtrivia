var express = require('express');
var router = express.Router();
const sql = require('mssql')
var moment = require('moment');
var config = require('../config/dbconfig')


sql.connect(config, function (err) {
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
  let now = moment(Date.now()).format("YYYY-MM-DD HH:MM:SS")
  if(req.body.correct == "correct") correct = 1;

  let tgs = req.body.tags.split(",");
  let inserts = tgs.map(x => `INSERT INTO dbo.tags (name, date_created, created_by) SELECT '${x.trim()}', '${now}', 1 where not exists (SELECT * FROM dbo.tags WHERE [name] = '${x.trim()}');`)
  let lookups = tgs.map(x => `'${x.trim()}',`).join(" ")
  lookups = lookups.substring(0, lookups.length - 1);

  var con = new sql.Request();
  con.query(`INSERT INTO dbo.questions (question, answer, correct, date, date_created, created_by, last_modified_by, round, date_last_modified) OUTPUT Inserted.ID
             VALUES ('${question}', '${answer}', ${correct}, '${date}', '${now}', 1, 1, ${round}, '${now}')`, (err, res)=> {
    if(err) console.log(err)

    var qid = res.recordset[0].ID
    con.query(inserts.join(" "), (err, res, fields)=>{
      if(err) console.log(err)

      con.query(`INSERT INTO dbo.question_tags (tag_id, question_id)
                 SELECT id, ${qid} FROM dbo.tags WHERE [name] IN(${lookups})`, 
        (err, res)=>{
          if(err) console.log(err)
      })
    })
  })
  res.redirect("/question/add")
})


module.exports = router;

