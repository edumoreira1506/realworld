const PostSchema = require('../schemas/PostSchema');
const ObjectId = require('mongoose').Types.ObjectId;

const byUser = async (user) =>
  await PostSchema.find({
    $or: [
      { user: new ObjectId(user._id) },
      { user: { $in: user.following } }
    ]
  }).sort({ createdAt: 'desc' })

module.exports = {
  byUser
}
