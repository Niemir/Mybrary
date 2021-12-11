const express = require('express')
const Author = require('../models/author')
const Book = require('../models/book')
const { check, validationResult } = require('express-validator')
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
  res.render('authors/new', { author: new Author() })
})

// Create author
router.post(
  '/',
  check('name')
    .exists()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 chars long')
    .isLength({ max: 20 })
    .withMessage('Name must be maximum 20 chars long'),
  async (req, res) => {
    const errors = validationResult(req)

    const author = new Author({
      name: req.body.name,
    })

    if (!errors.isEmpty()) {
      return res.render('authors/new', {
        author,
        errorMessage: errors.errors[0].msg,
      })
    }

    try {
      const newAuthor = await author.save()
      res.redirect(`authors/${newAuthor.id}`)
    } catch {
      res.render('authors/new', {
        author,
        errorMessage: 'Error creating author',
      })
    }
  },
)

router.get('/:id', async (req, res) => {
  // let author
  // let booksByAuthor
  try {
    const author = await Author.findById(req.params.id)
    const booksByAuthor = await Book.find({
      author: author.id,
    }).exec()
    res.render(`authors/show`, { author, booksByAuthor })
  } catch {
    res.redirect('/')
  }
})

router.get('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    res.render('authors/edit', {
      author,
    })
  } catch {
    res.render('/authors')
  }
})

router.put('/:id', async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    author.name = req.body.name
    await author.save()
    res.redirect(`/authors/${author.id}`)
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.render('authors/edit', {
        author,
        errorMessage: 'Error updating author',
      })
    }
  }
})

router.delete('/:id', async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    await author.remove()
    res.redirect(`/authors`)
  } catch {
    if (author == null) {
      res.redirect('/')
    } else {
      res.render(`authors/edit`, { author, errorMessage: 'Cannot delete user, becouse he still has books.' })
    }
  }
})

module.exports = router
