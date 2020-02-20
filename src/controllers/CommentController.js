const Comment = require('../models/Comment');

const store = (req, res) => {
  const { id } = req.params;
  const comment = req.body;
  const token = req.header('Authorization');

  return Comment.store(token, comment, id, {
    onError: message => {
      res.send({
        ok: false,
        message
      }).status(400);
    },
    onStored: post => {
      res.send({
        ok: true,
        post
      }).status(201);
    },
    onNotFound: () => {
      res.send({
        ok: false,
        message: 'Not found'
      }).status(404)
    }
  });
}

const show = (req, res) => {
  const { id } = req.params;

  return Comment.find(id, {
    onFind: comments => {
      res.send({
        ok: true,
        comments
      }).status(200)
    },
    onNotFound: () => {
      res.send({
        ok: false,
        message: 'Not found'
      }).status(404)
    }
  });
}

module.exports = {
  store,
  show
}
