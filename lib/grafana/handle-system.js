const { logger, logConfig } = require('@vtfk/logger')
const statDb = require('../stat-db')
const httpResponse = require('../http-response')
const groupDocuments = require('./group-documents')

module.exports = async function (context, system, start, end) {
  logConfig({
    prefix: `azf-statistics - Grafana - ${system}`
  })

  try {
    logger('info', ['Fetching collections/system names'], context)
    const db = await statDb()
    const collection = db.collection(system)

    if (!collection) {
      logger('error', [`System ${system} not found`], context)
      return httpResponse(404, { message: `System ${system} not found` })
    }

    const filter = {
      createdTimestamp: {
        $gte: start,
        $lte: end
      }
    }

    const documents = await collection.find(filter).toArray()
    logger('info', [`Successfully fetched ${documents.length} documents from collection ${system} in time range ${start} <-> ${end}`], context)

    const result = documents.map(document => {
      return {
        timestamp: document.createdTimestamp,
        [document.type]: 1
      }
    })

    const groupedResult = groupDocuments(result)
    return httpResponse(200, groupedResult)
  } catch (error) {
    logger('error', ['Error fetching collections/system names', error.toString()], context)
    return httpResponse(500, error)
  }
}
