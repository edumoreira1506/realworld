const express = require('express')

const MainController = require('../controllers/MainController')
const UserController = require('../controllers/UserController')
const PostController = require('../controllers/PostController')
const CommentController = require('../controllers/CommentController')

const routes = express.Router()

routes.get('/', MainController.index)

routes.post('/user', UserController.store)
routes.get('/user/:id', UserController.show)
routes.delete('/user/:id', UserController.remove)
routes.patch('/user/:id', UserController.update)
routes.post('/user/:id/follow', UserController.follow)

routes.post('/auth', UserController.login)

routes.post('/post', PostController.store)
routes.get('/post/:id', PostController.show)
routes.delete('/post/:id', PostController.remove)
routes.patch('/post/:id', PostController.update)

routes.post('/post/:id/comment', CommentController.store)
routes.get('/post/:id/comment', CommentController.show)

module.exports = routes
