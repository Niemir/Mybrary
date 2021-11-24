const express = require('express')
const Author = require('../models/author')
const router = express.Router()
// All authors route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }

  try {
    console.log(searchOptions)
    const authors = await Author.find(searchOptions)
    res.render('authors/index', {
      authors: authors,
      searchOptions: req.query,
    })
  } catch {
    console.log('wut')
    res.redirect('/')
  }
})
// New author role
router.get('/new', (req, res) => {
  res.render('authors/new', { autgor: new Author() })
})

// Create author
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name,
  })
  try {
    const newAuthor = await author.save()
    // res.redirect(`authors/${newAuthor.id}`)
    res.redirect('authors')
  } catch {
    res.render('authors/new', {
      author,
      errorMessage: 'Error creating author',
    })
  }
})

module.exports = router
