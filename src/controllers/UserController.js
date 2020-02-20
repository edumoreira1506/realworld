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

module.exports = {
  store
}
