require('./config/config.js')

var express = require('express')
var bodyParser = require('body-parser')
var {
    ObjectID
} = require('mongodb')
var _ = require('lodash')

var {
    mongoose
} = require('./db/mongoose')
var {
    Todo
} = require('./models/todo.js')
var {
    User
} = require('./models/user.js')
var {
    authenticate
} = require('./middleware/authenticate.js')

var port = process.env.PORT

var app = express()

app.use(bodyParser.json())

app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    })
    todo.save().then(doc => {
        res.status(200).send(doc)
    }, e => {
        res.status(400).send(e)
    })
})

app.get('/todos', authenticate, (req, res) => {
    Todo.find({ _creator: req.user._id }).then(todos => {
        res.send({
            todos
        })
    }).catch(err => {
        res.status(400).send(err)
    })
})

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id
    if (ObjectID.isValid(id)) {
        Todo.findOne({
            _id: id,
            _creator: req.user._id
        }).then(todo => {
            if (!todo) {
                res.status(404).send({
                    message: 'Todo is not exist'
                })
            } else {
                res.send({
                    todo
                })
            }
        }).catch(err => {
            res.send(err)
        })
    } else {
        res.status(404).send({
            message: 'Id invalid'
        })
    }
})


app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id
    if (ObjectID.isValid(id)) {
        Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        }).then(todo => {
            if (!todo) {
                res.status(404).send({
                    message: 'Todo is not exist'
                })
            }
            res.status(200).send({
                message: 'Todo deleted successfully',
                deletedTodo: todo
            })

        }).catch(err => {
            res.send(err)
        })
    } else {
        res.status(404).send({
            message: 'Id invalid'
        })
    }
})
app.get('/todos/:id', (req, res) => {
    var id = req.params.id
    if (ObjectID.isValid(id)) {
        Todo.findById(id).then(todo => {
            if (!todo) {
                res.status(404).send({
                    message: 'Todo is not exist'
                })
            } else {
                res.send({
                    todo
                })
            }
        }).catch(err => {
            res.send(err)
        })
    } else {
        res.status(404).send({
            message: 'Id invalid'
        })
    }
})


app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id
    var body = _.pick(req.body, ['text', 'completed'])
    if (!ObjectID.isValid(id)) {
        return res.status(404).send({
            message: 'Id invalid'
        })
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false
        body.completedAt = null
    }

    Todo.findOneAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {
        $set: body
    }, {
        new: true
    }).then(todo => {
        if (!todo) {
            return res.status(404).send()
        }
        res.status(200).send({
            todo
        })

    }).catch(e => {
        res.send(400).send()
    })
})


app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user)

})

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password'])
    var user = new User(body)
        //we are not passing user in (then()) because the is only one (user) var in the function 

    user.save().then(() => {
        return user.generateAuthToken()

    }).then((token) => {
        res.header('x-auth', token).send(user)
    }).catch(err => {
        res.status(400).send(err)
    })
})

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password'])
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user)
        })
    }).catch((e) => {
        res.status(400).send()
    })
})

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send()
    }, () => {
        res.status(400).send()
    })
})


module.exports = {
    app
}


app.listen(port, () => {
    console.log(`Started on port ${port}`)
})