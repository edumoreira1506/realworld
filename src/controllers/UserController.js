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

const show = (req, res) => {
  const { id } = req.params;

  return User.find(id, {
    onFind: user => {
      res.send({
        ok: true,
        user
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

const update = (req, res) => {
  const { id } = req.params;
  const token = req.header('Authorization');
  const newProps = req.body;

  return User.update(id, token, newProps, {
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

const login = (req, res) => {
  const { email, password } = req.body;

  return User.login(email, password, {
    onAuthorized: user => {
      res.send({
        ok: true,
        user
      })
    },
    onUnauthorized: () => {
      res.send({
        ok: false,
        message: 'Username or password invalid'
      })
    }
  })
}

const follow = (req, res) => {
  const { id } = req.params;
  const token = req.header('Authorization');

  return User.follow(id, token, {
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
    onFollowed: () => {
      res.send({
        ok: true,
        message: 'Success!'
      }).status(201);
    },
  });
}

module.exports = {
  store,
  remove,
  show,
  update,
  login,
  follow
}
