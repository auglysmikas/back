const express = require('express')
const router = express.Router()

const {registerUser, login, upload, getMovies, getMovie, makeReview} = require('../controllers/mainController')
const {registerValidate} = require('../middle/validator')

router.post('/register', registerValidate, registerUser)
router.post('/login', login)
router.post('/upload', upload)

router.get('/movies', getMovies)
router.get('/movie/:id', getMovie)

router.post('/makeReview', makeReview)



module.exports = router