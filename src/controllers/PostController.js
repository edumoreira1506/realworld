const Post = require('../models/Post');

const store = (req, res) => {
  const post = req.body;
  const token = req.header('Authorization');

  return Post.store(token, post, {
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
  });
}

const show = (req, res) => {
  const { id } = req.params;

  return Post.find(id, {
    onFind: post => {
      res.send({
        ok: true,
        post
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
