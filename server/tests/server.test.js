const expect = require('expect')
const request = require('supertest')
const { ObjectID } = require('mongodb')

const { app } = require('../server.js')
const { Todo } = require('../models/todo.js')

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
}]

// // beforeEach((done) => {
// //     Todo.remove({}).then(() => done())
// // })

beforeEach(done => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos)
    }).then(() => done())
})


// describe('POST /todos', () => {
//     it('should create a new todo', (done) => {
//         var text = 'Test todo test'
//         request(app)
//             .post('/todos')
//             .send({ text })
//             .expect(200)
//             .expect((res) => {
//                 expect(res.body.text).toBe(text)
//             })
//             .end((e, res) => {
//                 if (e) {
//                     return done(e)
//                 }
//                 Todo.find().then(todos => {
//                     expect(todos.length).toBe(1)
//                     expect(todos[0].text).toBe(text)
//                     done()
//                 }).catch(e => {
//                     done(e)
//                 })
//             })
//     })
//     it('should not create todo with invalid body data', (done) => {
//         request(app)
//             .post('/todos')
//             .send({})
//             .expect(200)
//             .end((err, res) => {
//                 if (err) {
//                     return done(err)
//                 }
//                 Todo.find().then(todos => {
//                     expect(todos.length).toBe(0)
//                     done()
//                 }).catch(e => done(e))
//             })
//     })
// })

// describe('Get /todos', () => {
//     it('should return all todos', (done) => {
//         request(app)
//             .get('/todos')
//             .expect(200)
//             .expect(res => {
//                 expect(res.body.todos.length).toBe(0)
//             })
//             .end(done)
//     })

console.log(todos[0]._id)

describe("/Get todos/:id", () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done)
    })

    it('should return 404 if todo not found', done => {
        var ObjId = new ObjectID()
        var id = ObjId._id.toHexString()
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .expect(res => {
                expect(res.body.message).toBe('Todo is not exist')
            })
            .end(done)
    })

    it('should return 400 if id is invalid', (done) => {
        request(app)
            .get('/todos/aaa')
            .expect(400)
            .expect(res => {
                expect(res.body.message).toBe('Id invalid')
            }).end(done)
    })
})

describe("DELETE /todos/:id", () => {
    it('should remove a todo', (done) => {
        var aid = todos[1]._id.toHexString()
        request(app)
            .delete(`/todos/${aid}`)
            .expect(200)
            .expect(res => {

                // This is assertion about the response of the request

                expect(res.body.deletedTodo._id).toBe(aid)
            }).end((err, res) => {
                if (err) {
                    return done(err)
                }

                // This is assertion about the existance of the doc. (another request using ORM) 

                Todo.findById(aid).then(todo => {
                    expect(todo).toBe(null)
                    done()
                }).catch(err => done(err))
            })
    })

    it('should return 404 if todo not found', (done) => {
        var ObjID = new ObjectID()
        var id = ObjID._id.toHexString()
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done)
    })

    it('should return 400 if todo id is invalid', (done) => {

        request(app)
            .delete('/todos/aaa')
            .expect(400)
            .end(done)
    })
})

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var id = todos[0]._id.toHexString()
        var text = "This is should new text"
        request(app)
            .patch(`/todos/${id}`)
            .send({
                text,
                completed: true
            })
            .expect(200)
            // This is assertion about the response of the request
            .expect(res => {
                expect(res.body.todo.text).toBe(text)
                expect(res.body.todo.completed).toBe(true)
                expect(res.body.todo.completedAt).toBeA('number')
            }).end(done)


    })

    it('should clear completed when todo is not completed', (done) => {
        var id = todos[1]._id.toHexString()
        var text = "Seconde todo new text test"

        request(app)
            .patch(`/todos/${id}`)
            .send({
                text,
                completed: false
            })
            .expect(200)
            .end(done)

        Todo.findById(id).then(todo => {
            expect(todo.text).toBe(text)
            expect(todo.completed).toBe(false)
            expect(todo.completedAt).toNotExist()
        }).catch(err => {
            end(done)
        })

    })
})