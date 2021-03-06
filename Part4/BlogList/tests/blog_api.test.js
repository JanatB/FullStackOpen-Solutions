const mongoose = require('mongoose')
const app = require('../app') 
const blogModel = require('../models/blog')
const userModel = require('../models/user')
const bcrypt = require('bcrypt')
const supertest = require('supertest') 
const testHelper = require('./test_helper')
const api = supertest(app)


describe('testing blogs', () => {

    // Apprently not initializing the 'headers' variable makes the code WORK. Maybe because headers gets treated like a variable instead of a built in feature

    // Before any blog tests are executed 
    beforeEach(async () => {

        // First register a single user
        await userModel.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new userModel({ username: 'root', passwordHash })

        await user.save()

        // Login with the user's credentials
        const loginInfo = {
            username:'root',
            name: '',
            password: 'sekret'
        }

        const logInResult = await api
            .post('/api/login')
            .send(loginInfo)
        
        // Set the headers
        headers = {
            'Authorization': `bearer ${logInResult.body.token}`
        }

        // Delete all & add default blog
        await blogModel.deleteMany({})
        const defaultBlog = {
            title: "default Blog",
            author: "Jan",
            url: "URL",
            likes: 20
        } 
        
        const submitDefaultBlog = await api
            .post('/api/blogs')
            .send(defaultBlog)
            .set(headers)
       
    })

    // Pass
    test('successfully added a blog', async () => {

        const newBlog = {
            title: "Test #1",
            author: "Jan",
            url: "URL#1",
            likes: 20
        } 

        const res = await api
            .post('/api/blogs')
            .send(newBlog)
            .set(headers)
            .expect(201)
            .expect('Content-Type', /application\/json/)


        // // Testing that the lengths are the same (No need just check the DB)

    })

    // Pass
    test('missing likes property but still added', async () => {

        const newBlog = {
            title: "Ozyy",
            author: "Unknown",
            url: "some URL"
        } 

        const res = await api
            .post('/api/blogs')
            .send(newBlog)
            .set(headers)
            .expect(201)
            .expect('Content-Type', /application\/json/)

    })

    // Pass
    test('missing URL and title', async () => {

        const newBlog = {
            author: "Jan Jan",
            likes: 10
        }

        const res = await api
            .post('/api/blogs')
            .send(newBlog)
            .set(headers)
            .expect(400)

    })

    test('succeds with status code 204 if ID is valid', async () => {

        const blogsBefore = await testHelper.blogsInDB()

        const newBlog = {
            title:"The best blog ever",
            author:"Me",
            url:"http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes:12
        }
      
        const result = await api
        .post('/api/blogs')
        .send(newBlog)
        .set(headers)
        .expect(201)

        const deleted = await api
        .delete(`/api/blogs/${result.body.id}`)
        .set(headers)
        .expect(204)

        const blogsNow = await testHelper.blogsInDB()

        expect(blogsBefore.length).toEqual(blogsNow.length)

    })

    test('updating a note with valid ID', async () => {

        const blog = {
            title:"The best blog ever",
            author:"Me",
            url:"http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 20
        }
      
        const result = await api
        .post('/api/blogs')
        .send(blog)
        .set(headers)
        .expect(201)
        
        const ID = result.body.id;

        const newBlog = {
            title:"Nothing"
        }

        const res = await api
            .put(`/api/blogs/${ID}`)
            .send(newBlog)
            .expect(200)

    })

    test('blog is returned as json and has the correct length', async () => {
        const res = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(res.body).toHaveLength(1)

    })

    test('The blog has an id property', async () => {
        const testing = await testHelper.blogsInDB()
        expect(testing.map(blog => blog.id)).toBeDefined() // map would through an error if every item didn't have the property

    })

})

describe('testing users', () => {

    // Before any user tests are executed
    beforeEach(async () => {

        await userModel.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new userModel({ username: 'root', passwordHash })

        await user.save()

    })

    test('new user added successfully', async () => {

        const usersAtStart = await testHelper.usersInDB()

        const newUser = {
            username: 'testing#1',
            name: 'Matti Luukkainen',
            password: 'password',
        }
      
        const result = await api
            .post('/api/user')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await testHelper.usersInDB()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    
        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)

    })

    test('new user logged in successfully with token returned', async () => {

        const loginInfo = {
            username:'root',
            name: '',
            password: 'sekret'
        }

        const result = await api
            .post('/api/login')
            .send(loginInfo)
            .expect(200)
        
        expect(result.body.username).toBe(loginInfo.username)

        // // Check the exsistence of a token
        expect(result.body.hasOwnProperty('token')).toBe(true)


    })

    test('creation fails if username is already taken', async () => {
        const usersAtStart = await testHelper.usersInDB()
    
        const newUser = {
          username: 'root',
          name: 'Superuser',
          password: 'salainen',
        }
    
        const result = await api
          .post('/api/user')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('username must be unique')
    
        const usersAtEnd = await testHelper.usersInDB()
        expect(usersAtEnd).toEqual(usersAtStart)

    })

    test('creation fails if username or password is not given', async () => {
        const usersAtStart = await testHelper.usersInDB()

        const newUser = {
            username: "",
            name: "Jan",
            password: "random"
        }

        const res = await api
            .post('/api/user')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(res.body.error).toContain('username or password not given.')
        const usersAtEnd = await testHelper.usersInDB()
        expect(usersAtEnd).toEqual(usersAtStart)

    })

    test('creation fails if username or password is less than 3 chars', async () => {

        const usersAtStart = await testHelper.usersInDB()

        const  newUser = {
            username: "J",
            name: "Jan", 
            password: "1234567"
        }

        const result = await api   
            .post('/api/user')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        
        expect(result.body.error).toContain( 'password and username need to be at least 3 characters long.');
        const usersAtEnd = await testHelper.usersInDB()
        expect(usersAtStart).toEqual(usersAtEnd)
            
    })

})

afterAll(() => {
    mongoose.connection.close()
})