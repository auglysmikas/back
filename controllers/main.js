const bcrypt = require('bcrypt')
const linkify = require('linkify')
const forumUserDb = require('../models/forumUserSchema')
const forumPostDb = require('../models/forumPostSchema')
const forumCommentDb = require('../models/forumCommentSchema')

const topicList = []
const commentList = []
const countPerPage = 10

module.exports = {
    userRegistration: async (req, res) => {

        const {name, email, pass1, pass2} = req.body
        const checkUser = await forumUserDb.findOne({email})
        if (checkUser) return res.send({success: false, message: "USER ALREADY IN DATABASE"})

        const hash = await bcrypt.hash(pass1, 10)

        const user = new forumUserDb()

        user.username = name
        user.email = email
        user.pass = hash
        user.image = "https://leocdn.trl.lt/lt/themes/bright3/images/noavatar2.jpg"
        user.postCount = 0
        user.save().then(res => {})

        return res.send({success: true})
    },
    userLogin: async (req, res) => {
        const {email, pass} = req.body
        const checkUser = await forumUserDb.findOne({email})

        if (!checkUser) {
            res.send({success: false, message: "NO SUCH USER"})
        } else {

            const find = await bcrypt.compare(pass, checkUser.pass)

            if (email === checkUser.email && find) {
                req.session.user = checkUser
                return res.send({success: true, checkUser})
            } else {
                res.send({success: false, message: "NO SUCH USER"})
            }
        }
    },
    newTopic: async (req, res) => {

        const {topic} = req.body
        const {user} = req.session

        if (user) {
            await forumUserDb.findOneAndUpdate({_id: user._id}, {$inc: {postCount: 1}}, {new: true})
            const newTopic = new forumPostDb()
            newTopic.username = user.username
            newTopic.post = topic
            newTopic.isRead = false
            newTopic.time = new Date().toLocaleString('lt-LT')
            newTopic.userId = user._id


            newTopic.save().then(data => {
                topicList.push(data)
                return res.send({success: true, data: topicList})
            })
        } else {
            return res.send({success: false, message: "ERROR WITH USER"})
        }
    },
    allPosts: async (req, res) => {
        const allPosts = await forumPostDb.find({})
        return res.send({success: true, allPosts})
    },
    openOneTopic: async (req, res) => {
        const {id, pageIndex} = req.params
        let skipIndex = 0;
        if (pageIndex > 1) {
            skipIndex = (Number(pageIndex) - 1) * countPerPage
        }

        const oneTopic = await forumPostDb.findOne({_id: id})
        if (oneTopic) {
            const findComments = await forumCommentDb.find({postId: id}).skip(skipIndex).limit(countPerPage)
            const findCommentCount = await forumCommentDb.count({postId: id})
            res.send({success: true, oneTopic, findComments, findCommentCount})
        } else {
            res.send({success: false})
        }
    },
    comm: async (req, res) => {
        const data = req.body
        const {user} = req.session

        const videoValid = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
        const imageValid = /\.(jpg|jpeg|png|gif|bmp)$/

        const linkText = data.comment.replace(/(https?\:\/\/)?([^\.\s]+)?[^\.\s]+\.[^\s]+/gi, (media) => {

            if (videoValid.test(media)) {
                const media1 = media.replace("watch?v=", "embed/")
                return `<br><iframe src=${media1}></iframe></br>`
            }
            if (imageValid.test(media)) {
                return `<br><img src=${media} alt/></br>`
            }
            if (!imageValid.test(media) && !videoValid.test(media)) {
                return `<a>${media}</a>`
            }
        })

        if (user) {
            await forumPostDb.findOneAndUpdate(
                {_id: data.postId},
                {$inc: {commentCounter: 1}},
                {new: true}
            )
            const postOwner = await forumPostDb.findOne({_id: data.postId})
            if (user.username !== postOwner.username){
                await forumPostDb.findOneAndUpdate(
                    {_id: data.postId},
                    {$set: {isRead: true}},
                    {new: true}
                )
            }

            const newReply = new forumCommentDb()
            newReply.username = user.username
            newReply.postId = data.postId
            newReply.userId = user._id
            newReply.post = linkText
            newReply.time = new Date().toLocaleString('lt-LT')

            newReply.save().then(data => {
                commentList.push(data)
                res.send({success: true, commentList})
            })
        } else {
            return res.send({success: false, message: "Please login"})
        }
    },
    changeProfilePhoto: async (req, res) => {
        const {user} = req.session
        const {id, photo} = req.body

        if (user) {
            const updatedUser = await forumUserDb.findOneAndUpdate({_id: id}, {$set: {image: photo}}, {new: true})
            return res.send({success: true, updatedUser})
        }
    },
    getMyPost: async (req, res) => {
        const {id} = req.params
        const {user} = req.session

        if (user) {
            const myPosts = await forumCommentDb.find({userId: id})
            res.send({success: true, myPosts})
        }

    },
    getMyTopics: async (req, res) => {
        const {id} = req.params
        const {user} = req.session

        if (user) {
            const myTopics = await forumPostDb.find({userId: id})
            res.send({success: true, myTopics})
        }
    },
    getPhoto: async (req, res) => {
        const {userId} = req.params
        const findUser = await forumUserDb.findOne({_id: userId})
        if (findUser) {
            res.send({success: true, findUser})
        }
    },
    LogOut: async (req, res) => {
        req.session.user = null
        res.send({success: true})
    },
}