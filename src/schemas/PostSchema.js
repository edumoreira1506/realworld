const { Schema, model } = require('mongoose')

const PostSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
  },
  title: {
    type: String,
    require: true
  },
  content: {
    type: String,
    require: true
  }
}, {
	timestamps: true
})

module.exports = model('Post', PostSchema)
