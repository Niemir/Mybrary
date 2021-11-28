const express = require('express')
const path = require('path')
const multer = require('multer')
const Book = require('../models/book')
const Author = require('../models/author')
const router = express.Router()
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  },
})

// All books route
router.get('/', async (req, res) => {
  res.send('All books')
  // res.redirect('books')
})

// New book role
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Create book
router.post('/', upload.single('cover'), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null
  // const { title, author, publishDate, pageCount, description } = req.body
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description,
  })
  try {
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect('books')
  } catch (error) {
    renderNewPage(res, book, true)
  }
})

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book,
    }
    if (hasError) params.errorMessage = 'Error Creating Book'
    res.render('books/new', params)
  } catch {
    res.redirect('/books')
  }
}
module.exports = router
