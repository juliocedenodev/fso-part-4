const blogRouter = require('express').Router()
const Blog = require('../models/Blog')
const User = require('../models/User')  


blogRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
    response.json(blogs);
  })
  
  blogRouter.post('/', async (request, response) => {
    const body = request.body;
    const user = await request.user;

    if(!user){
      return response.status(401).json({ error: 'invalid user' });
    }

    const blog = new Blog({
      title : body.title,
      author : body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id
    })
   
      const result = await blog.save();
      user.blogs = user.blogs.concat(result._id);
      await user.save();
      response.json(result);
    
  })

  blogRouter.delete('/:id', async (request, response) => {
    const user = await request.user;
    
    if(!user){
      return response.status(401).json({ error: 'invalid user' });
    }

  if(user) {
    const blog = await Blog.findById(request.params.id)

    if ( blog.user.toString() === user.id)
    {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  }
  else {
    return response.status(401).json({ error: 'invalid user' })
  }
  }
    
  })

  blogRouter.put('/:id', async (request, response) => {
    const body = request.body
  
    const blog = {
      ...body.title,
      ...body.author,
      ...body.url,
      likes: body.likes,
    }
     const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context:'query' })
    
     response.json(updatedBlog)
   
  })
  module.exports = blogRouter