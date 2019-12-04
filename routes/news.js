module.exports = function(app, conn, upload) {
  var express = require('express');
  var router = express.Router();
  var category = require('../lib/category.js');

  /* 목록 */
  router.get('/', (req, res) => {
    var selectedCategory = req.query.category;
    if (!selectedCategory) {
      selectedCategory = "";
    }

    category.get(conn, function(categoryList) {

      var sql = "SELECT a.*, c.title as `category_title` "
                + "FROM article a "
                + "INNER JOIN category c on a.category = c.id "
      var sqlParam = []

      if (selectedCategory) {
        sql += "WHERE a.category = ? "
        sqlParam.push(selectedCategory);
      }

      conn.query(sql, sqlParam, function(err, news, fields){
        if(err){
          res.status(500).send('Internal Server Error: ' + err);
        } else {
          res.render('news/index', {
            news:news,
            category: categoryList,
            selectedCategory: selectedCategory
          });
        }
      });
    });
  });

  /* 추가 */
  router.get('/add', (req, res) => {
    category.get(conn, function(categoryList) {
      res.render('news/add', {
        category: categoryList
      });
    });
  });

  /* Form 데이터 DB INSERT */
  router.post('/add', upload.single('upload'), (req, res) => {
    var title = req.body.title;
    var category = req.body.category;
    var desc = req.body.desc;
    var author = req.body.author;
    var upload = req.file.filename;

    var sql = 'INSERT INTO article (`title`, `category`, `desc`, `author`, `upload`, `inserted`) VALUES(?, ?, ?, ?, ?, now())';
    conn.query(sql, [title, category, desc, author, upload], function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.redirect('/news/' + result.insertId);
      }
    });
  });

  /* 수정 */
  router.get('/:id/edit', (req, res) => {
    var id = req.params.id;

    category.get(conn, function(categoryList) {
      var sql = "SELECT a.*, c.title as `category_title` "
                + "FROM article a "
                + "INNER JOIN category c on a.category = c.id "
                + "WHERE a.id=?";

      conn.query(sql, [id], function(err, news, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error: ' + err);
        } else {
          res.render('news/edit', {news:news[0], category: categoryList});
        }
      });
    });
  });

  /* Form 데이터 DB UPDATE */
  router.post('/:id/edit', upload.single('upload'), (req, res) => {
    var id = req.params.id;
    var category = req.body.category;
    var title = req.body.title;
    var desc = req.body.desc;
    var author = req.body.author;

    if (typeof req.file !== 'undefined') {
      var sql = 'UPDATE article SET title = ?, `category` = ?, `desc`= ?, `author` = ?, `updated` = now(), `upload` = ? WHERE id = ?;';
      var sqlParam = [title, category, desc, author, req.file.filename, id]
    } else {
      var sql = 'UPDATE article SET title = ?, `category` = ?, `desc`= ?, `author` = ?, `updated` = now() WHERE id = ?;';
      var sqlParam = [title, category, desc, author, id]
    }

    conn.query(sql, sqlParam, function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.redirect('/news/' + id);
      }
    });
  });

  /* Delete confirmation */
  router.get('/:id/delete', (req, res) => {
    var id = req.params.id;
    var sql = 'SELECT * FROM article WHERE id=?';
    conn.query(sql, [id], function(err, news, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.render('news/delete', {news:news[0]});
      }
    });
  });
  
  /*  Delete confirmation */
  router.get('/:id/cdelete', (req, res) => {
    var id = req.params.id;
    var sql = 'SELECT * FROM comments WHERE id=?';
    conn.query(sql, [id], function(err, comments, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.render('news/cdelete', {comments:comments[0]});
      }
    });
  });


  /* DELETE DB row */
  router.post('/:id/delete', (req, res) => {
    var id = req.params.id;
    var sql = 'DELETE FROM article WHERE id = ?';
    conn.query(sql, [id], function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.redirect('/news/');
      }
    });
  });

  /*댓글 DELETE DB row*/
  router.post('/:id/cdelete', (req, res) => {
    var id = req.params.id;
    var sql = 'DELETE FROM comments WHERE id = ?';
    conn.query(sql, [id], function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.redirect('/news/');
      }
    });
  });

  /* 상세보기 */
  router.get('/:id', (req, res) => {
    var id = req.params.id;
    var sql = "SELECT a.*, c.title as `category_title` "
              + "FROM article a "
              + "INNER JOIN category c on a.category = c.id "
              + "WHERE a.id=?";

    conn.query(sql, [id], function(err, news, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
          var sql = "SELECT `comments` FROM `comments`";
            conn.query(sql, [], function(err, comments, fields){
            if(err){
              console.log(err);
              res.status(500).send('Internal Server Error: ' + err);
            } else {
              var array = [];
              for(i=0; i<comments.length; i++)
              array.push(comments[i]);
              res.render('news/detail', {
              news: news[0],
              comments: comments
            });
          }
        });
      }
    });
  });
  router.post('/:id/', (req, res) => {
    console.log(req.body);
    var id = req.params.id;
    var comments = req.body.comments;
    var sql = 'INSERT INTO `comments` (`comments`) VALUES(?)';
    conn.query(sql, [comments], function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.redirect('/news/'+id);
      }
    });
  });


  router.post('comments/:id/delete', (req, res) => {
    var id = req.params.id;

    var sql = 'DELETE FROM comments WHERE id = ?';
    conn.query(sql, [id], function(err, result, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error: ' + err);
      } else {
        res.redirect('/news/');
      }
    });
  });


  return router;
}; 