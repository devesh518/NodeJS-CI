const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache')

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    // const redis = require('redis')
    // const redisURL = 'redis://127.0.0.1:6379'
    // const client = redis.createClient(redisURL)
    // const util = require('util')
    // // We use promisify to make the function return a promise instead of writing a callback
    // client.get = util.promisify(client.get)
    // // Now we need to write a callback function in the client.get below

    // const cachedBlogs = await client.get(req.user.id)
    // // Do we have any cached data? If yes, respond immediately and return
    // if(cachedBlogs){
    //   // cachedBlogs will be in a stringified form, since all the values in redis store must be stringified
    //   // Hence we need to parse it and send it to the user
    //   console.log("serving from cache");
    //   return res.send(JSON.parse(cachedBlogs));
    // }

    // // If no, respond to request and update the cache
    // const blogs = await Blog.find({ _user: req.user.id });
    // res.send(blogs);
    // console.log("serving from MongoDB");

    // // We need to stringify the blogs since all the values in redis have to be stringified
    // client.set(req.user.id, JSON.stringify(blogs))    
    const blogs = await Blog.find({ _user: req.user.id }).cache({ key: req.user.id });
    // The cache method at the end specifies that we want to only cache this query in our code, and nothing else
    res.send(blogs)
  });

  app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
