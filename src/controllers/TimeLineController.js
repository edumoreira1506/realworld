const User = require('../models/User');

const show = (req, res) => {
  const { id } = req.params;

  return User.getTimeLine(id, {
    onFound: posts => {
      res.send({
        ok: true,
        posts
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
  show
}
