const mongoose = require('mongoose');
const config = require('../utils/config');
const logger = require('../utils/logger')

mongoose.connect(config.MONGODB_URI)
.then(() => {
    logger.info('Connected to MongoDB')
})
.catch((error) => {
    logger.error('Error connecting to MongoDB: ', error.message)
})

const blogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    author: String,
    url: {type: String, required: true},
    likes: {type: Number, default: 0},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
})

module.exports = mongoose.model('blog', blogSchema) 