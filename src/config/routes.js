const express = require('express')

const MainController = require('../controllers/MainController')

const routes = express.Router()

routes.get('/', MainController.index)

module.exports = routes
