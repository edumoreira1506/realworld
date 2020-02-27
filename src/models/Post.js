const User = require('./User');
const PostSchema = require('../schemas/PostSchema');
const ObjectId = require('mongoose').Types.ObjectId;

const store = async (token, post, callback) => {
  const user = await User.findByToken(token);

  if (!user) return callback.onError('User does not exist');
  if (!hasRequiredFields(post)) return callback.onError('Required: title and content');

  const serializedPost = serializePost(post, user);

  return persist(serializedPost, callback);
};

const find = async (id, callback) => {
  const post = await findById(id);

  if (!post) return callback.onNotFound();

  const user = await User.findById(post.user);

  return callback.onFind({
    title: post.title,
    content: post.content,
    updatedAt: post.updatedAt,
    createdAt: post.createdAt,
    user: {
      image: user.image,
      username: user.username
    }
  });
}

const remove = async (id, token, callback) => {
  const userToken = await User.findByToken(token);
  const post = await findById(id);

  if (!post) return callback.onNotFound();
  if (!userToken) return callback.onError('Invalid token');
  if (belongsTo(post, userToken)) return await deleteById(id, callback);

  return callback.onNotAllowed();
}

const update = async (id, token, newProps, callback) => {
  const userToken = await User.findByToken(token);
  const post = await findById(id);

  if (!post) return callback.onNotFound();
  if (!userToken) return callback.onError('Invalid token');
  if (belongsTo(post, userToken)) return await editById(id, newProps, callback);

  return callback.onNotAllowed();
}

const belongsTo = (post, user) => post.user.toString() === user._id.toString();

const deleteById = async (id, callback) => await PostSchema.deleteOne({
  _id: new ObjectId(id)
}, error => error ? callback.onError(error) : callback.onDeleted());

const editById = async (id, newProps, callback) => await PostSchema.updateOne({
  _id: new ObjectId(id)
}, newProps, error => 
  error ? callback.onError(error) : callback.onUpdated()
);

const serializePost = (post, user) => ({
  title: post.title,
  content: post.content,
  user: user._id
});

const hasRequiredFields = post => (
  post.title && post.content
);

const findById = async (id) => await PostSchema.findOne({ _id: new ObjectId(id) });

const persist = async (post, callback) =>
  PostSchema.create(post, (error, small) =>
    error ? callback.onError(error) : callback.onStored(small)
  );

const favorite = async (id, token, callback) => {
  const post = await findById(id);
  const user = await User.findByToken(token);

  if (!post) return callback.onNotFound();
  if (!user) return callback.onError('Invalid token');
  if (User.isSameId(user, { _id: post.user })) return callback.onError('You cam not favorite yours posts');

  const newProps = {
    favorites:
      alreadyFavorite(post, user)
        ? removeFavorite(post.favorites, user._id)
        : addFavorite(post.favorites, user._id)
  }

  return await editById(post.id, newProps, {
    onError: callback.onError,
    onUpdated: callback.onFavorited
  });
}

const addFavorite = (favorites, user) => [ ...favorites, user ];

const removeFavorite = (favorites, user) =>
  favorites.filter(item => user.toString() != item);

const alreadyFavorite = (post, user) =>
  post.favorites.some(item => item.toString() == user._id);

const byUser = async (userId, callback) => {
  if (!userId) return callback.onNotFound();

  const user = User.isId(userId) ? await User.findById(userId) : await User.findByUsername(userId);

  if (!user) return callback.onNotFound();

  const posts = await findByUser(user);
  const postsWithUser = posts.map(post => ({
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    favorites: post.favorites,
    _id: post._id,
    user: {
      image: user.image,
      username: user.username
    }
  }))

  return callback.onFind(postsWithUser);
}

const findByUser = async (user) =>
  await PostSchema.find({ user: new ObjectId(user._id) });

const favoritesByUser = async (userId, callback) => {
  if (!userId) return callback.onNotFound();

  const user = User.isId(userId) ? await User.findById(userId) : await User.findByUsername(userId);

  if (!user) return callback.onNotFound();

  const posts = await findFavorites(user);
  const postsWithUser = await Promise.all(posts.map(async (post) => {
    const userOfPost = await User.findById(post.user);

    return {
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      favorites: post.favorites,
      _id: post._id,
      user: {
        image: userOfPost.image,
        username: userOfPost.username
      }
    }
  }));

  return callback.onFind(postsWithUser);
}

const findFavorites = async (user) =>
  await PostSchema.find({ favorites: user._id });

module.exports = {
  store,
  find,
  remove,
  update,
  findById,
  favorite,
  byUser,
  favoritesByUser
}
