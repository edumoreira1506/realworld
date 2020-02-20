const { Schema, model } = require('mongoose')

const CommentSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  content: {
    type: String,
    require: true
  }
}, {
	timestamps: true
})

module.exports = model('Comment', CommentSchema)
