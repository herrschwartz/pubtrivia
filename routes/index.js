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
  request.query(`select q.question, q.answer, q.[date], q.correct,  q.[round], q.date_created, q.date_last_modified, cr.[name] as [created_by], lm.[name] as [mod_by]
                 from triviasql.dbo.questions q left join dbo.[user] cr on q.created_by = cr.id
                 left join dbo.[user] lm on q.last_modified_by = lm.id where q.id=${qid}; 
           select [name] from dbo.tags join dbo.question_tags ON tag_id = id and question_id = ${qid}`, 
    function (err, recordset) {
    if (err) console.log(err)

    //console.log(recordset)
    console.log(recordset.recordsets[1])
    res.render('question_display', {'qs': recordset.recordset[0], 'tag': recordset.recordsets[1]}) ;
  });
})

router.get('/question/add', function(req, res, next){
  res.render('add_question', {})
})

router.post('/question/add/', function(req, response, next){
  const question = req.body.question.replace("'","''");
  const answer = req.body.answer.replace("'","''");
  const date = moment(req.body.date).format("YYYY/MM/DD");
  const round = req.body.round;
  let correct = 0;
  let now = moment(Date.now()).format("YYYY-MM-DD hh:mm:ss a")
  if(req.body.correct == "correct") correct = 1;

  let tgs = req.body.tagdata.substring(0, req.body.tagdata.length-1).split(",");
  let inserts = tgs.map(x => `INSERT INTO dbo.tags (name, date_created, created_by) SELECT '${x.trim()}', '${now}', 1 where not exists (SELECT * FROM dbo.tags WHERE [name] = '${x.trim()}');`)
  let lookups = tgs.map(x => `'${x.trim()}',`).join(" ")
  lookups = lookups.substring(0, lookups.length - 1);
  let qinsert = `INSERT INTO dbo.questions (question, answer, correct, date, date_created, created_by, last_modified_by, round, date_last_modified) OUTPUT Inserted.ID
  VALUES ('${question}', '${answer}', ${correct}, '${date}', '${now}', 1, 1, ${round}, '${now}')`
  console.log(qinsert)

  var con = new sql.Request();
  con.query(qinsert, (err, res) => {
    if(err) {
      console.log(err)
      response.render('add_question', {'err': err, 'msg': "let Tim know question insert fucked up"})
    }

    var qid = res.recordset[0].ID
    con.query(inserts.join(" "), (err, res, fields)=>{
      if(err) {
        console.log(err)
        response.render('add_question', {'err': err, 'msg': "let Tim know tag insert fucked up"})
      } 

      con.query(`INSERT INTO dbo.question_tags (tag_id, question_id)
                 SELECT id, ${qid} FROM dbo.tags WHERE [name] IN(${lookups})`, 
        (err, res)=>{
          if(err) {
            console.log(err)
            response.render('add_question', {'err': err, 'msg': "let Tim know tag m2m association fucked up"})
          }
      })
    })
  })
  response.redirect("/question/add")
})


module.exports = router;

