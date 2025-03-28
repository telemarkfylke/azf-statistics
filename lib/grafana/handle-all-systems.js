const { logger, logConfig } = require('@vtfk/logger')
const statDb = require('../stat-db')
const httpResponse = require('../http-response')

module.exports = async function (context, start, end) {
  logConfig({
    prefix: 'azf-statistics - Grafana - Systems'
  })

  try {
    logger('info', ['Fetching collections/system names'], context)
    const db = await statDb()
    const collections = await db.listCollections().toArray()
    logger('info', [`Successfully fetched collections/system names - Length: ${collections.length}`], context)

    const result = []
    let documentCount = 0
    const filter = {
      createdTimestamp: {
        $gte: start,
        $lte: end
      }
    }

    for (const collectionObject of collections) {
      const collection = db.collection(collectionObject.name)
      const documentCountInCollection = await collection.countDocuments(filter)
      documentCount += documentCountInCollection
      logger('info', [`Successfully fetched ${documentCountInCollection} documents from collection ${collectionObject.name}`], context)
      result.push({
        system: collectionObject.name,
        count: documentCountInCollection
      })
    }

    logger('info', [`Successfully fetched a total of ${documentCount} documents in time range ${start} <-> ${end}`], context)
    return httpResponse(200, result)
  } catch (error) {
    logger('error', ['Error fetching collections/system names', error.toString()], context)
    return httpResponse(500, error)
  }
}
