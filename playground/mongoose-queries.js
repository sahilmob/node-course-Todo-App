const { ObjectID } = require('mongodb');
const { mongoose } = require('./../server/db/mongoose.js')
const { Todo } = require('./../server/models/todo.js')
const { User } = require('./../server/models/user.js')

var id = '5b1b15c63f3bc00e35a60e87';
var uid = '5b188b251897090a685fe95b'

// Todo.find({
//     _id: id
// }).then(todos => {
//     console.log("Todos", todos)
// })

User.findById(uid).then(user => {
    if (!user) {
        return console.log("User not found")
    }
    console.log("User: ", user)
}).catch(e => {
    console.log("Error fetching user")
})


// Todo.findOne({
//     _id: id
// }).then(todo => {
//     console.log("Todo", todo)
// })

if (!ObjectID.isValid(id)) {
    console.log("Id is not valid")

} else {
    Todo.findById(id).then(todoById => {
        if (!todoById) {
            return console.log('Id not found')
        }
        console.log("Todo", todoById)
    }).catch(err => {
        console.log(err)
    })
}