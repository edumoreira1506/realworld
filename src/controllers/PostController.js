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

const remove = (req, res) => {
  const { id } = req.params;
  const token = req.header('Authorization');

  return Post.remove(id, token, {
    onDeleted: () => {
      res.send({
        ok: true,
        message: 'Post deleted!'
      }).status(200);
    },
    onNotAllowed: () => {
      res.send({
        ok: false,
        message: 'Not allowed'
      }).status(401);
    },
    onNotFound: () => {
      res.send({
        ok: false,
        message: 'Not found'
      }).status(404)
    },
    onError: message => {
      res.send({
        ok: false,
        message
      }).status(400)
    }
  });
}

const update = (req, res) => {
  const { id } = req.params;
  const token = req.header('Authorization');
  const newProps = req.body;

  return Post.update(id, token, newProps, {
    onUpdated: () => {
      res.send({
        ok: true,
        message: 'Success!'
      }).status(204);
    },
    onNotAllowed: () => {
      res.send({
        ok: false,
        message: 'Not allowed'
      }).status(401);
    },
    onNotFound: () => {
      res.send({
        ok: false,
        message: 'Not found'
      }).status(404)
    },
    onError: message => {
      res.send({
        ok: false,
        message
      }).status(400)
    }
  });
}

const favorite = (req, res) => {
  const { id } = req.params;
  const token = req.header('Authorization');

  return Post.favorite(id, token, {
    onError: message => {
      res.send({
        ok: false,
        message
      }).status(400)
    },
    onNotFound: () => {
      res.send({
        ok: false,
        message: 'Not found'
      }).status(404)
    },
    onFavorited: () => {
      res.send({
        ok: true,
        message: 'Success!'
      }).status(201);
    },
  });
}

module.exports = {
  store,
  show,
  remove,
  update,
  favorite
}
