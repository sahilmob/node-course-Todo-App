var { User } = require('./../models/user.js')
var authenticate = (req, res, next) => {
    var token = req.header('x-auth')
    User.findByToken(token).then((user) => {
        if (!user) {
            //we could send res.status(401).send(), but return Promise.reject() will run the catch block
            return Promise.reject()
        }
        req.user = user
        req.token = token
        next()
    }).catch(err => {
        res.status(401).send()
    })

}

module.exports = { authenticate }