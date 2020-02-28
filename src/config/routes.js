const express = require('express')
const cors = require('cors')

const MainController = require('../controllers/MainController')
const UserController = require('../controllers/UserController')
const PostController = require('../controllers/PostController')
const CommentController = require('../controllers/CommentController')
const TimeLineController = require('../controllers/TimeLineController')

const routes = express.Router()

routes.all('*', cors());

routes.get('/', MainController.index)

routes.post('/user', UserController.store)
routes.get('/user/:id', UserController.show)
routes.get('/user', UserController.search)
routes.delete('/user/:id', UserController.remove)
routes.patch('/user/:id', UserController.update)
routes.post('/user/:id/follow', UserController.follow)

routes.get('/user/:id/posts', PostController.byUser)
routes.get('/user/:id/posts_favorites', PostController.favoritesByUser)

routes.get('/user/:id/time_line', TimeLineController.show)

routes.post('/auth', UserController.login)

routes.post('/post', PostController.store)
routes.get('/post/:id', PostController.show)
routes.delete('/post/:id', PostController.remove)
routes.patch('/post/:id', PostController.update)

routes.post('/post/:id/favorite', PostController.favorite)

routes.post('/post/:id/comment', CommentController.store)
routes.get('/post/:id/comment', CommentController.show)

routes.delete('/comment/:id', CommentController.remove)

module.exports = routes
