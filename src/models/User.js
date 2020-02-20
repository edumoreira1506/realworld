const UserSchema = require('../schemas/UserSchema');
const { hasNumber, hasUpperCase, encrypt, decrypt } = require('../helpers/string');
const ObjectId = require('mongoose').Types.ObjectId;

const usernameCharacters = {
  min: 5,
  max: 15
}

const passwordCharacters = {
  min: 8,
  max: 20
}

const store = async (user, callback) => {
  if (!hasRequiredFields(user)) return callback.onError('Required: Email, username, password and confirm password');
  if (await isEmailDuplicated(user.email)) return callback.onError('Duplicated email');
  if (await isUsernameDuplicated(user.username)) return callback.onError('Duplicated username');
  if (!isUsernameValid(user.username)) return callback.onError(`Username needs to have between ${usernameCharacters.min} and ${usernameCharacters.max} characters`);
  if (user.password !== user.confirmPassword) return callback.onError('Password and confirm password are differents');
  if (!isValidPassword(user.password)) return callback.onError(`Password must have between ${passwordCharacters.min} and ${passwordCharacters.max}, a number and a uppercase letter`);

  const serializedUser = serializeUser({
    ...user,
    token: generateToken(user),
    password: encrypt(user.password),
    followers: [],
    following: []
  });

  return persist(serializedUser, callback);
};

const remove = async (id, token, callback) => {
  const userToken = await findByToken(token);
  const userId = await findById(id);

  if (!userId) return callback.onNotFound();
  if (!userToken) return callback.onError('Invalid token');
  if (isSameToken(userToken, userId)) return await deleteById(id, callback);

  return callback.onNotAllowed();
}

const find = async (id, callback) => {
  const user = await findById(id);

  if (user) return callback.onFind({
    email: user.email,
    username: user.username,
    image: user.image,
    bio: user.bio,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt
  })

  return callback.onNotFound();
}

const update = async (id, token, newProps, callback) => {
  const userToken = await findByToken(token);
  const userId = await findById(id);

  if (!userId) return callback.onNotFound();
  if (!userToken) return callback.onError('Invalid token');
  if (isSameToken(userToken, userId)) {
    if (Object.prototype.hasOwnProperty.call(newProps, 'email'))
      if (await isEmailDuplicated(newProps)) return callback.onError('Duplicated email');
    
    if (Object.prototype.hasOwnProperty.call(newProps, 'username')) {
      if (await isUsernameDuplicated(newProps)) return callback.onError('Duplicated username');
      if (!isUsernameValid(newProps)) return callback.onError(`Username needs to have between ${usernameCharacters.min} and ${usernameCharacters.max} characters`);
    }

    if (Object.prototype.hasOwnProperty.call(newProps, 'password')) {
      if (newProps.password !== newProps.confirmPassword) return callback.onError('Password and confirm password are differents');
      if (!isValidPassword(newProps)) return callback.onError(`Password must have between ${passwordCharacters.min} and ${passwordCharacters.max}, a number and a uppercase letter`);
    }

    return await editById(id, newProps, callback);
  }

  return callback.onNotAllowed();
}

const login = async (email, password, callback) => {
  if (!email || !password) return callback.onUnauthorized();

  const user = await findByEmail(email);

  if (!user) return callback.onUnauthorized();
  
  const decryptedPassword = decrypt(user.password);

  if (decryptedPassword === password) return callback.onAuthorized(user);
  return callback.onUnauthorized();
}

const isSameToken = (user1, user2) => user1.token === user2.token;

const generateToken = ({ username, password, email }) =>
  encrypt(`email:${email}|username:${username}|password:${password}`);

const hasRequiredFields = user => (
  user.username && user.email &&
  user.password && user.confirmPassword
);

const isUsernameDuplicated = async (username) => Boolean(await findByUsername(username));

const isEmailDuplicated = async (email) => Boolean(await findByEmail(email));

const findByEmail = async (email) => await UserSchema.findOne({ email });

const findByToken = async (token) => await UserSchema.findOne({ token });

const findByUsername = async (username) => await UserSchema.findOne({ username });

const findById = async (id) => await UserSchema.findOne({ _id: new ObjectId(id) });

const editById = async (id, newProps, callback) => await UserSchema.updateOne({
  _id: new ObjectId(id)
}, newProps, error => 
  error ? callback.onError(error) : callback.onUpdated()
);

const isUsernameValid = username => (
  username.length >= usernameCharacters.min &&
  username.length < usernameCharacters.max
);

const isValidPassword = password => (
  password.length >= passwordCharacters.min &&
  password.length < passwordCharacters.max &&
  hasNumber(password) && hasUpperCase(password)
);

const serializeUser = ({
  email, username, password, bio, image, token, followers, following
}) => ({
  email, username, password, bio, image, token, followers, following
});

const persist = async (user, callback) =>
  UserSchema.create(user, (error, small) =>
    error ? callback.onError(error) : callback.onStored(small)
  );

const deleteById = async (id, callback) => await UserSchema.deleteOne({
  _id: new ObjectId(id)
}, error => error ? callback.onError(error) : callback.onDeleted());

const follow = async (id, token, callback) => {
  const userId = await findById(id);
  const userToken = await findByToken(token);

  if (isSameToken(userId, userToken)) return callback.onError('You can not follow you')
  if (!userId) return callback.onNotFound();
  if (!userToken) return callback.onError('Invalid token');

  const newProps = {
    followers:
      alreadyFollows(userToken, userId)
        ? removeFollower(userId.followers, userToken._id)
        : addFollower(userId.followers, userToken._id)
  }

  return await editById(userToken._id, newProps, {
    onError: callback.onError,
    onUpdated: callback.onFollowed
  });
}

const addFollower = (followers, follower) => [ ...followers, follower ];

const removeFollower = (followers, follower) =>
  followers.filter(user => user.toString() != follower);

const alreadyFollows = (follower, followed) =>
  followed.followers.some(user => user.toString() == follower._id);

module.exports = {
  store,
  remove,
  find,
  update,
  login,
  follow,
  findByToken,
  findById
}
