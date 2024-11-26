const { logger, logConfig } = require('@vtfk/logger')
const httpResponse = require('../lib/http-response')
const statDb = require('../lib/stat-db')

module.exports = async function (context, req) {
  logConfig({
    prefix: 'azf-statistics - Systems'
  })

  try {
    logger('info', ['Fetching collections/system names'], context)
    const db = await statDb()
    const collections = await db.listCollections().toArray()
    logger('info', [`Successfully fetched collections/system names - Length: ${collections.length}`, 'Mapping to only collection names'], context)
    const collectionNames = collections.map((collection) => collection.name)
    logger('info', [`Successfully mapped collections to only collection names - Length: ${collectionNames.length}`], context)
    return httpResponse(200, collectionNames)
  } catch (error) {
    logger('error', ['Error fetching collections/system names', error.toString()], context)
    return httpResponse(500, error)
  }
}
