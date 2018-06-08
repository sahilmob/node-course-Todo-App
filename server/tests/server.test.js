const expect = require('expect')
const request = require('supertest')

const { app } = require('../server.js')
const { Todo } = require('../models/todo.js')

beforeEach((done) => {
    Todo.remove({}).then(() => done())
})


describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo test'
        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text)
            })
            .end((e, res) => {
                if (e) {
                    return done(e)
                }
                Todo.find().then(todos => {
                    expect(todos.length).toBe(1)
                    expect(todos[0].text).toBe(text)
                    done()
                }).catch(e => {
                    done(e)
                })
            })
    })
    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                Todo.find().then(todos => {
                    expect(todos.length).toBe(0)
                    done()
                }).catch(e => done(e))
            })
    })
})

describe('Get /todos', () => {
    it('should return all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(0)
            })
            .end(done)
    })
})