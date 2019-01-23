const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const logger = require('winston')

const url = process.env.MONGO_URI
const dbName = 'sneak-scrims-labs'
const mClient = new MongoClient(url)
var mDB

function exitHandler(options, exitCode) {
  options, exitCode
  mClient.close()
  process.exit()
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup:true }))

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit:true }))

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit:true }))
process.on('SIGUSR2', exitHandler.bind(null, { exit:true }))

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit:true }))

const getCollection = (name) => {
  return mDB.collection(name)
}

const insertDocument = (collectionName, document, callback) => {
  getCollection(collectionName).insertOne(document, callback)
}

const findOne = (collectionName, query, callback) => {
  getCollection(collectionName).findOne(query, {}, callback)
}

const checkExists = (collectionName, query, callback) => {
  getCollection(collectionName).findOne(query, {}, (err, res) => {
    callback(err, res !== null)
  })
}

const findOneAndUpdate = (collectionName, query, update, callback) => {
  getCollection(collectionName).findOneAndUpdate(query, update, {}, callback)
}

const deleteMany = (collectionName, query, callback) => {
  getCollection(collectionName).deleteMany(query, callback)
}


module.exports = {
  initialize: (callback) => {
    mClient.connect(function(err) {
      assert.strictEqual(null, err, 'Failed to connect to DB')
      logger.info('Connected successfully to DB')

      mDB = mClient.db(dbName)
      callback()
    })
  },
  getCollection,
  insertDocument,
  checkExists,
  findOneAndUpdate,
  deleteMany,
  findOne,
}
