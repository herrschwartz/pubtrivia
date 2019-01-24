var express = require('express');
var router = express.Router();
const sql = require('mssql')

router.get('/', (req, res)=> {
    var request = new sql.Request();
    request.query('SELECT * FROM dbo.v_tag_list order by name asc', function (err, recordset) {
      if (err) console.log(err)
      res.render('tags', {'qs': recordset.recordset});
    });
})

router.get('/get/:tid', (req, res)=> {
    let tid = req.params.tid
    var request = new sql.Request();
    request.query(`SELECT t.[name], q.question, q.id
    FROM dbo.tags t
    JOIN dbo.question_tags qt ON t.id = qt.tag_id
    JOIN dbo.questions q ON q.id = qt.question_id
    WHERE t.id = ${tid}`, 
    function (err, recordset) {
      if (err) console.log(err)
      res.render('tag_display', {'qs': recordset.recordset, tag: recordset.recordset[0].name});
    });
})
module.exports = router;