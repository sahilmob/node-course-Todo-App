const { MongoClient, ObjectID } = require('mongodb');



MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server')
    }
    console.log('Connected to MongoDB server')
    const db = client.db('TodoApp')

    db.collection('Todos').findOneAndUpdate({
        text: "Walk the dog"
    }, {
        $set: {
            completed: false
        }
    }, {
        returnOriginal: false
    }).then(res => {
        console.log(res)
    })


    // client.close()
})