const User = require('../models/User');

const store = (req, res) => {
  const user = req.body;

  return User.store(user, {
    onError: message => {
      res.send({
        ok: false,
        message
      }).status(400);
    },
    onStored: user => {
      res.send({
        ok: true,
        user
      }).status(201);
    },
  });
};

const remove = (req, res) => {
  const { id } = req.params;
  const token = req.header('Authorization');

  return User.remove(id, token, {
    onDeleted: () => {
      res.send({
        ok: true,
        message: 'User deleted!'
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

module.exports = {
  store,
  remove
}
