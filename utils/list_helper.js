const _ = require('lodash');


const dummy = (blogs) => {
    blogs = [
        {
            title: "Hola Mundo!",
            author: "Julio",
            url: "juliocedeno.me",
            likes:4
        },
        {
            title: "Bienvenidos a mi blog!",
            author: "Julio",
            url: "juliocedeno.me",
            likes:8
        },

        {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url:"http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 12
          }

    ]

    return 1;
  }

  const totalLikes = (blogs) => {
    const totalLikes = Object.values(blogs).reduce((sum, current) => sum+current.likes, 0)
    return totalLikes;
  }
  
const favoriteBlog = (blogs) => {
    const likes = blogs.map(x => x.likes)
    const mostLikes = Math.max(...likes)
    const favoriteBlog = blogs.find(x => x.likes === mostLikes)
    return favoriteBlog;

}

const mostLikes = (blogs) => {
  const likesSum = _.chain(blogs)
        .groupBy("author")
        .map( (element, name) => ({
            author: name,
            likes: _.sumBy(element, 'likes'),
        }))
        .value();

        const mostLikes =_.maxBy(likesSum, obj=> obj.likes)

        return mostLikes;
}

const mostBlogs = (blogs) => {

  const blogAuthorCounter =_.reduce(blogs, (obj, blog) => {
    obj[blog.author] = obj[blog.author] ? obj[blog.author] + 1 : 1;
  
    return obj;
  },{});

  const blogCount = _.chain(blogs)
  .groupBy("author")
  .map( (element,name) => ({
      author: name,
      blogs: blogAuthorCounter[name]
  }))
  .value();

  const mostBlogsCount =_.maxBy(blogCount, obj=> obj.author)

  return mostBlogsCount;
}

  module.exports = {
    dummy, totalLikes, favoriteBlog, mostLikes, mostBlogs
  }