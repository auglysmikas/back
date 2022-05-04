const express = require('express')
const router = express.Router()

const {
    userRegistration,
    userLogin,
    newTopic,
    allPosts,
    openOneTopic,
    comm,
    changeProfilePhoto,
    getMyPost,
    getMyTopics,
    getPhoto,
    LogOut,
} = require('../controllers/main')
const {Registration, Topic, Comment} = require('../middleware/main')

router.post('/register', Registration, userRegistration)
router.post('/login', userLogin)
router.get('/logout', LogOut)
router.get('/allPosts', allPosts)

router.post('/writeTopic', Topic, newTopic)
router.post('/replies', Comment, comm)
router.post('/changePhoto', changeProfilePhoto)

router.get('/openTopic/:id/:pageIndex', openOneTopic)
router.get('/myPost/:id', getMyPost)
router.get('/myTopics/:id', getMyTopics)
router.get('/replyPhoto/:userId', getPhoto)

module.exports = router