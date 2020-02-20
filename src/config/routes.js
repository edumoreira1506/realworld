const express = require('express')

const HelloController = require('../controllers/HelloController')

const routes = express.Router()

routes.get('/', HelloController.index)

module.exports = routes
