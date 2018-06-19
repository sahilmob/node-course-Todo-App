const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

//over-wrights the original method that returns the object when calling POST /users and return only the id and email -and not password- picked by _.pick
UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject() //convert mongoose object to regular object

    return _.pick(userObject, ['_id', 'email'])
}

UserSchema.methods.generateAuthToken = function() {
    //this line bind (user) var to the user that we are currently manipulating
    var user = this;
    var access = 'auth'
    var token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString()
    user.tokens = user.tokens.concat([{ access, token }])
        //we are not passing token in (then()) because the is only one (token) var in the function 
    return user.save().then(() => {
        return token
    })
}

UserSchema.methods.removeToken = function(token) {
    var user = this
    return user.update({
        $pull: {
            tokens: { token }
        }
    })
}

UserSchema.statics.findByToken = function(token) {
    var User = this
    var decoded = null

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
        // return new Promise((resolve, reject) => {
        //     reject()
        // })

        return Promise.reject('test')

    }
    return User.findOne({
        '_id': decoded._id,
        //we wrapped token.tokens by '' because we want to query a nested item... 
        //P.S. is is not obligatory to wrap _id with '' because it is not nested, but we could do this for consistency 
        'tokens.token': token,
        'tokens.access': 'auth'

    })
}

UserSchema.statics.findByCredentials = function(email, password) {
    var User = this
    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject()
        }
        //we used "new Promise" because bcrypt dose not support promises
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    //we did not user 'return resolve... or return reject... because we already returning in return new Promise'
                    return resolve(user)
                } else {
                    reject()
                }
            })
        })
    })

}

UserSchema.pre('save', function(next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash
                next()
            })
        })

    } else {
        next()
    }
})



var User = mongoose.model('User', UserSchema)

module.exports = { User }