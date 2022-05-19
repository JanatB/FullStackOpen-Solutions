
// The Request Listener (parameters to http.createServer() in index.js)

const express = require('express')
const app = express()
const cors = require('cors')
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogModel = require('./models/blog')
const blogRouter = require('./controllers/blog');
const middleware = require('./utils/middleware')

// Middleware
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/blogs', blogRouter) // Used only if url starts with './api/blogs'
app.use(middleware.unknownEndpoint) // When the endpoint is unknown
app.use(middleware.errorHandler)

// express.static build goes somewhere in here

module.exports = app;