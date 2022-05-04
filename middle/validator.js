const sendError = (res, msg) => {
    res.send({success: false, message: msg})
}

module.exports = {
    registerValidate: (req, res, next) =>{
        const { username, pass1, pass2} = req.body

        if(username.length>20 || username.length<4) return sendError(res, 'bad username')
        if(pass1.length>20 || pass1.length<4) return sendError(res, 'bad password')
        if(pass1 !== pass2) return sendError(res, 'bad password')

    next()
    }
}