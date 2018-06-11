require('./config/config.js')

var express = require('express')
var bodyParser = require('body-parser')
var { ObjectID } = require('mongodb')
var _ = require('lodash')

var { mongoose } = require('./db/mongoose')
var { Todo } = require('./models/todo.js')
var { User } = require('./models/user.js')

var port = process.env.PORT

var app = express()

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    })
    todo.save().then(doc => {
        res.send(doc)
    }, e => {
        res.send(e)
    })
})

app.get('/todos', (req, res) => {
    Todo.find({}).then(todos => {
        res.send({ todos })
    }).catch(err => {
        res.status(400).send(err)
    })
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
                res.send({ todo })
            }
        }).catch(err => {
            res.send(err)
        })
    } else {
        res.status(400).send({
            message: 'Id invalid'
        })
    }
})


app.delete('/todos/:id', (req, res) => {
    var id = req.params.id
    if (ObjectID.isValid(id)) {
        Todo.findByIdAndRemove(id).then(todo => {
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
        res.status(400).send({
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
                res.send({ todo })
            }
        }).catch(err => {
            res.send(err)
        })
    } else {
        res.status(400).send({
            message: 'Id invalid'
        })
    }
})


app.patch('/todos/:id', (req, res) => {
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

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then(todo => {
        if (!todo) {
            return res.status(404).send()
        }
        res.status(200).send({ todo })

    }).catch(e => {
        res.send(400).send()
    })
})

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password'])
    var user = new User(body)

    user.save().then(() => {
        return user.generateAuthToken()

    }).then((token) => {
        res.header('x-auth', token).send(user)
    }).catch(err => {
        res.status(400).send(err)
    })
})



module.exports = { app }


app.listen(port, () => {
    console.log(`Started on port ${port}`)
})