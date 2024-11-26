const { logger } = require('@vtfk/logger')
const MongoClient = require('mongodb').MongoClient
const { mongoDB } = require('../config')

let client = null

/**
 *
 * @returns {Promise<import('mongodb').Db>}
 */
module.exports = async () => {
  if (client === null) {
    logger('info', ['mongo', 'new client init'])
    try {
      client = new MongoClient(mongoDB.statisticsConnectionString)
      await client.connect()
    } catch (error) {
      client = null // reset if we could not connect
      throw error
    }
  } else {
    logger('info', ['mongo', 'client already exists. Quick return'])
  }
  return client.db(mongoDB.statisticsDatabase)
}
