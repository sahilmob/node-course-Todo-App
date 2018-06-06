const { MongoClient, ObjectID } = require('mongodb');



MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server')
    }
    console.log('Connected to MongoDB server')
    const db = client.db('TodoApp')
    db.collection('Todos').find().count().then((count) => {
            console.log("Todos")
            console.log(count)
        }).catch(err => {
            console.log('Unable to fetch Todos')
        })
        // db.collection('Todos').find({ _id: new ObjectID('5b1856e79d75de158dd376ac') }).toArray().then((docs) => {
        //     console.log("Todos")
        //     console.log(JSON.stringify(docs, undefined, 2))
        // }).catch(err => {
        //     console.log('Unable to fetch Todos')
        // })

    db.collection('Users').find({ name: "Sahil" }).toArray().then((names) => {
        console.log(names)
    })


    // client.close()
})