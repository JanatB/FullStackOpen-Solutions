
// Main file - runs server

const http = require('http')
const app = require('./app')
const logger = require('./utils/logger')
const config = require('./utils/config')
const server = http.createServer(app)

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}...`)
})


// Notes: 
// app.js holds the actual express application (+ everything Mongoose related)
// This simply runs the server and the logger