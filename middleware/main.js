const valid = require('email-validator')
const forumUserDb = require('../models/forumUserSchema')

module.exports = {
    Registration: async (req, res, next) => {
        const {name, email, pass1, pass2} = req.body

        if (!valid.validate(email)) return res.send({ success: false, message: "BAD EMAIL"})

        const emailExist = await forumUserDb.findOne({ email })

        if (emailExist){
            return res.send({ success: false, message: "EMAIL IS ALREADY REGISTERED" })
        }

        if (name.length < 3 ){
            return res.send({success: false, message: "NAME IS TOO SHORT"})
        }

        if (pass1.length < 3 ) {
            return res.send({success: false, message: "AT LEAST 4 CHARACTERS IN PASSWORD"})
        }

        if (pass1 !== pass2) {
            return res.send({success: false, message: "PASSWORD DO NOT MATCH"})
        } else {
            next()
        }
    },
    Topic: async (req, res, next) => {
        const {topic} = req.body
        if (topic.length < 1){
            return res.send({success: false, message: "ENTER NEW TOPIC"})
        } else {
            next ()
        }
    },
    Comment: async (req,res, next) => {
        const {comment} = req.body
        if(comment.length < 1){
            return res.send({success: false, message: "ENTER NEW COMMENT"})
        } else {
            next()
        }
    }
}