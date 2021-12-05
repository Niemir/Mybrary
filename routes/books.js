const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']

// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title) {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore) {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter) {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books,
      searchOptions: req.query,
    })
  } catch {
    res.redirect('/')
  }
})

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', async (req, res) => {
  const { title, author, publishDate, pageCount, description } = req.body

  const book = new Book({
    title,
    author,
    publishDate: new Date(publishDate),
    pageCount: parseInt(pageCount),
    description,
  })
  saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    res.redirect(`books/${newBook.id}`)
  } catch {
    renderNewPage(res, book, true)
  }
})

// Show book route
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show', { book })
  } catch {
    res.redirect('/')
  }
})

// Edit book route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  } catch {
    res.redirect('/')
  }
})
// Update book route
router.put('/:id', async (req, res) => {
  const { title, author, publishDate, pageCount, description } = req.body

  let book
  try {
    book = await Book.findById(req.params.id)
    book.title = title
    book.author = author
    book.publishDate = new Date(publishDate)
    book.pageCount = pageCount
    book.description = description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch (err) {
    console.log(err)
    if (book != null) {
      renderEditPage(res, book, true)
    } else {
      res.redirect('/')
    }
  }
})

// Delete book
router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect(`/books`)
  } catch {
    if (book != null) {
      res.render('books/show', {
        book,
        errorMessage: 'Could not remove book',
      })
    } else {
      res.redirect(`/`)
    }
  }
})

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}
async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors,
      book,
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Editing Book'
      } else if (form === 'new') {
        params.errorMessage = 'Error Creating Book'
      } else {
        params.errorMessage = 'Error with Book route'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}
function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}
module.exports = router
