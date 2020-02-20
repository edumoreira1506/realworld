const express = require('express')

const MainController = require('../controllers/MainController')
const UserController = require('../controllers/UserController')

const routes = express.Router()

routes.get('/', MainController.index)

routes.post('/user', UserController.store)
routes.get('/user/:id', UserController.show)
routes.delete('/user/:id', UserController.remove)

module.exports = routes
