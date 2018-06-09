var express = require('express')
var bodyParser = require('body-parser')
var { ObjectID } = require('mongodb')
var { mongoose } = require('./db/mongoose')
var { Todo } = require('./models/todo.js')
var { User } = require('./models/user.js')


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


module.exports = { app }


app.listen(3000, () => {
    console.log('Started on port 3000')
})