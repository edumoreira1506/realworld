const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
	email: {
		type: String,
		require: true,
	},
	username: {
		type: String,
		require: true
	},
	password: {
		type: String,
		require: true,
  },
  bio: {
		type: String,
		maxlength: 255
  },
	image: {
		type: String,
		default: 'https://static.productionready.io/images/smiley-cyrus.jpg'
	},
	token: {
		type: String,
		require: true
	},
	followers: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	following: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]
}, {
	timestamps: true
})

module.exports = model('User', UserSchema)
