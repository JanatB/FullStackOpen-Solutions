const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const userModel = require('../models/user')

// '/api/user' is the route

userRouter.post('/', async (req, res) => {
  // Data sent by the user (Destructuring assignment needs to be in order)
  const { username, name, password } = req.body

  if (!(username && password)){
    return res.status(400).json({ error: 'username or password not given.' })
  }

  if (username.length < 3 || password.length< 3){
    return res.status(400).json({ error: 'password and username need to be at least 3 characters long.' })
  }

  const existingUser = await userModel.findOne({ username })
  if (existingUser) {
    return res.status(400).json({ error: 'username must be unique' })
  }

  const saltRounds = 10 // The number of rounds to secure the hash (The salt is autogenerated)
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new userModel({ // Only saving the hashed password to the DB
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()
  res.status(201).json(savedUser)
  
})

userRouter.get('/', async (req, res) => {
  const users = await userModel.find({}).populate('blogs', { title: 1})
  res.json(users)

})

module.exports = userRouter

// Client sends username and password to server. Server does not immediatly add the textbased password. Instead, it hashes it first and then adds it to the DB. The response from the server also excludes the passwordHashed 
// with the help of the toJSON method. 

// 'blogs' is an attribute of the user schema "blogs": [ add_here ]
// Without populate, just the object ID of the blogs would be visable. With populate, we get to query the DB to find all USERS + find all BLOGS that have their IDs in the users and display them together