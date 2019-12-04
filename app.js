const express = require('express')
const app = express()
const port = 3000
/* test: abcdefghijikkk * Github/

/* Session */
const session = require('express-session');
app.use(session({
  secret: '@#@$MYSIGN#@$#$',
  resave: false,
  saveUninitialized: true
}));
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});

/* Database */
var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'mysqlmysql',
  database : 'news_stack',
  port: 3306  /* 8889 on Mac client */
});

/* Upload */
var multer = require('multer');
var upload = multer({ dest: 'uploads/' })
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
var upload = multer({ storage: _storage })
app.use('/uploads', express.static('uploads'));

/* URL */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

/* Template */
app.set('view engine','ejs');
app.set('views','./views');
app.locals.moment = require('moment');

/* static */
app.use('/static', express.static('static'));

/* root app */
var root = require('./routes/root.js')(app, conn, upload);
app.use('/', root);

/* news app */
var news = require('./routes/news.js')(app, conn, upload);
app.use('/news', news);

/* account app */
var account = require('./routes/account.js')(app, conn, upload);
app.use('/account', account);

/* admin app */
var account = require('./routes/admin.js')(app, conn, upload);
app.use('/admin', account);

/* 목록 */
app.get('/news/:id/', (req, res) => {
  var sql = 'SELECT * FROM comments';
  conn.query(sql, function(err, comments, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.render('detail', {comments:comments});
    }
  });
});

/* 추가 */
app.get('/news/:id', (req, res) => {
  res.render('comments', {});
});

/* Form 데이터 DB INSERT */
app.post('/news', (req, res) => {
  var comments = req.body.comments;

  var sql = 'INSERT INTO news (`comments`) VALUES(?)';
  conn.query(sql, [comments], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/news' + result.insertId); 
    }
  });
});


/* Form 데이터 DB UPDATE */
app.post('/news/:id/', (req, res) => {
  var id = req.params.id;
  var cid = req.params.cid;
  var comments = req.body.comments;

  var sql = 'UPDATE news SET id = ?, `cid`= ?, `comments` = ? WHERE id = ?;';
  conn.query(sql, [ id, cid, comments,], function(err, err, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/news/:id' + id);
    }
  });
});

/* Delete confirmation 
app.get('/news/:id/delete', (req, res) => {
  var id = req.params.id;
  var sql = 'SELECT * FROM commnet WHERE id=?';
  conn.query(sql, [id], function(err, news, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.render('news_delete', {news:news[0]});
    }
  });
});

/* DELETE DB row
app.post('/news/:id/delete', (req, res) => {
  var id = req.params.id;

  var sql = 'DELETE FROM news WHERE id = ?';
  conn.query(sql, [id], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/news/');
    }
  });
});


/* Port listening */
app.listen(port, () => console.log(
    `Server is running... http://localhost:${port}`
))
