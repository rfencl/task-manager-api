// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;
// const ObjectID = mongodb.ObjectID;
// Using object destructuring to save some code.
const { MongoClient, ObjectID } = require('mongodb');

const connnectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

MongoClient.connect(
  connnectionURL,
  { useNewUrlParser: true },
  (error, client) => {
    if (error) {
      return console.log('Unable to connect to database!');
    }
    const db = client.db(databaseName);
    
    // db.collection('users')
    //   .deleteMany({
    //     age: 27,
    //   })
    //   .then((result) => {
    //     console.log(result.deletedCount);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    db.collection('tasks')
      .deleteOne({
        description: "Mow the lawn",
      })
      .then((result) => {
        console.log(result.deletedCount);
      })
      .catch((error) => {
        console.log(error);
      });

  }
);
