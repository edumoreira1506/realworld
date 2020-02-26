const UserSchema = require('../schemas/UserSchema');
const { hasNumber, hasUpperCase, encrypt, decrypt } = require('../helpers/string');
const ObjectId = require('mongoose').Types.ObjectId;
const TimeLine = require('./TimeLine');

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

const isId = string => string.length >= 23;

const find = async (id, callback) => {
  const user = isId(id) ? await findById(id) : await findByUsername(id);

  if (user) return callback.onFind({
    email: user.email,
    username: user.username,
    image: user.image,
    bio: user.bio,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
    id: user._id
  })

  return callback.onNotFound();
}

const extractNewProps = (newProps, oldProps) => {
  const keys = Object.keys(newProps);
  const props = keys.reduce((props, key) => {
    if (newProps[key] === oldProps[key]) {
      return { ...props }
    }

    return { ...props, [key]: newProps[key] };
  }, {});

  return props;
}

const update = async (id, token, newPropsRequest, callback) => {
  const userToken = await findByToken(token);
  const userId = await findById(id);

  if (!userId) return callback.onNotFound();
  if (!userToken) return callback.onError('Invalid token');

  const newProps = extractNewProps(newPropsRequest, userToken);

  if (isSameToken(userToken, userId)) {
    if (Object.prototype.hasOwnProperty.call(newProps, 'email'))
      if (await isEmailDuplicated(newProps.email)) return callback.onError('Duplicated email');
    
    if (Object.prototype.hasOwnProperty.call(newProps, 'username')) {
      if (await isUsernameDuplicated(newProps.username)) return callback.onError('Duplicated username');
      if (!isUsernameValid(newProps.username)) return callback.onError(`Username needs to have between ${usernameCharacters.min} and ${usernameCharacters.max} characters`);
    }

    if (Object.prototype.hasOwnProperty.call(newProps, 'password')) {
      if (newProps.password !== newProps.confirmPassword) return callback.onError('Password and confirm password are differents');
      if (!isValidPassword(newProps.password)) return callback.onError(`Password must have between ${passwordCharacters.min} and ${passwordCharacters.max}, a number and a uppercase letter`);
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

const isSameId = (user1, user2) => user1._id.toString() === user2._id.toString();

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
  email, username, password, bio, image, token, following
}) => ({
  email, username, password, bio, image, token, following
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

  if (!userId) return callback.onNotFound();
  if (!userToken) return callback.onError('Invalid token');
  if (isSameToken(userId, userToken)) return callback.onError('You can not follow you')

  const newProps = {
    following:
      alreadyFollows(userToken, userId)
        ? removeFollower(userToken.following, userId._id)
        : addFollower(userToken.following, userId._id)
  }

  return await editById(userToken._id, newProps, {
    onError: callback.onError,
    onUpdated: callback.onFollowed
  });
}

const addFollower = (following, follower) => [ ...following, follower ];

const removeFollower = (following, follower) =>
  following.filter(user => user.toString() != follower.toString());

const alreadyFollows = (follower, followed) =>
  follower.following.some(user => user.toString() == followed._id.toString());

const getTimeLine = async (id, callback) => {
  const user = await findById(id);

  if (!user) return callback.onNotFound();

  const posts = await TimeLine.byUser(user);
  const postsWithUser = await Promise.all(posts.map(async (post) => {
    const { username, image } = await findById(post.user);

    return {
      _id: post._id,
      content: post.content,
      title: post.title,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      favorites: post.favorites,
      user: {
        username,
        image
      }
    }
  }))

  return callback.onFound(postsWithUser);
}

module.exports = {
  store,
  remove,
  find,
  update,
  login,
  follow,
  findByToken,
  findById,
  isSameId,
  isId,
  findByUsername,
  getTimeLine
}
