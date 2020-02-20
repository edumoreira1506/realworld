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

module.exports = {
  store
}
