const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const Blog = require('../models/Blog')
const helper = require('./test_helper')

const api = supertest(app)

let token = null;
beforeAll((done) => {
  const credentials ={
    username: "root",
    password: "sekret"
  }
   api
        .post('/api/login')
        .send(credentials)
        .end((err, req) => {
          token = req.body.token; // Or something
          done();
        })
})

beforeEach(async () =>{
    await Blog.deleteMany({})

    for(let blog of helper.initialBlogs)
    {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }   
}, 5000)


test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all blogs are returned', async () => {
    const response = await helper.blogsInDb()
  
    expect(response).toHaveLength(helper.initialBlogs.length)
  })

  test('all ids are defined correctly', async () => {
    const response = await helper.blogsInDb()
  
    response.forEach(blog => {
        expect(blog.id).toBeDefined();
      });
  })
  
describe('adding a blog post', () => {
    test('a valid blog post can be added', async () => {
  
      const newBlog = {
          title: "Hola Mundo!",
          author: "Julio",
          url: "juliocedeno.me",
          likes: 4
      }
    
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
      const response = await helper.blogsInDb()
    
      const author = response.map(r => r.author)
    
      expect(response).toHaveLength(helper.initialBlogs.length + 1)
      expect(author).toContain(
        'Julio'
      )
    })
  
    test('a blog without title and url is not added', async () => {
      const newBlog = { 
          author: "Julio",
          likes: 4
      }
    
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
    
      const response = await helper.blogsInDb()
    
      expect(response).toHaveLength(helper.initialBlogs.length)
    })
  
  
    test('a valid blog post without likes will be equal to 0', async () => {
      const newBlog = {
          title: "Hola Mundo!",
          author: "Julio",
          url: "juliocedeno.me",
      }
    
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
      const response = await helper.blogsInDb()
    
      const likes = response.map(r => r.likes)
    
      expect(response).toHaveLength(helper.initialBlogs.length + 1)
      expect(likes).toContain(0)
    })

    test('a blog wil not be added if the user doesnt login first', async () => {
      const newBlog = { 
        title: "Hola Mundo!",
        author: "Julio",
        url: "juliocedeno.me",
        likes: 4
      }
    
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
    
      const response = await helper.blogsInDb()
    
      expect(response).toHaveLength(helper.initialBlogs.length)
    })
})

describe('deletion of a blog post', () => {
  test('succeeds with status code 204 if id is valid', async () =>{
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api
  .delete(`/api/blogs/${blogToDelete.id}`)
  .set('Authorization', `Bearer ${token}`)
  .expect(204);

  const response = await helper.blogsInDb();
  expect(response).toHaveLength(helper.initialBlogs.length - 1);

  const title = response.map(r => r.title);
  expect(title).not.toContain(blogToDelete.title);

  })
})

describe('update of a blog post', () => {
  test('succeeds with status code 200 if id is valid', async () =>
  {
  const blogsAtStart = await helper.blogsInDb();
  const blogToUpdate = blogsAtStart[0];
  const updateBlog = {
    ...blogToUpdate,
    likes: 4
  }

  await api
  .put(`/api/blogs/${blogToUpdate.id}`)
  .send(updateBlog)
  .expect(200)
  .expect('Content-Type', /application\/json/);

  const response = await helper.blogsInDb();
  expect(response).toHaveLength(helper.initialBlogs.length);

  const likes = response.map(r => r.likes)
  expect(likes).toContain(updateBlog.likes);
  })
})

  afterAll(() => {
    mongoose.connection.close()
  })