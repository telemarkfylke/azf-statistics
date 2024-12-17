const statDb = require('../lib/stat-db')
const httpResponse = require('../lib/http-response')
const { createStatistic } = require('../lib/create-statistic')
const { logger, logConfig } = require('@vtfk/logger')
const { parseQueryFilter } = require('../lib/parse-query')

module.exports = async function (context, req) {
  logConfig({
    prefix: 'azf-statistics - Stat'
  })
  if (req.method.toUpperCase() === 'POST') {
    const { body } = req
    if (!body) return httpResponse(400, 'Please provide a request body')

    const statsData = body
    // Check params as well
    const { system } = req.params

    if (system) {
      logger('info', ['System is present in params, overrinding system in statistics data (body'], context)
      statsData.system = system
    }

    let stat
    try {
      logger('info', ['Creating statistics object'], context)
      stat = createStatistic(body)
      logger('info', ['Created statistics object', 'system', stat.system], context)
    } catch (error) {
      logger('error', ['Error creating statistics object', error.toString()], context)
      return httpResponse(400, error)
    }
    try {
      const db = await statDb()
      const collection = db.collection(stat.system)
      logger('info', ['Uploading statistics object to MongoDB', 'system', stat.system], context)
      const res = await collection.insertOne(stat)
      logger('info', ['Successfully uploaded statistics object to MongoDB', 'system', stat.system], context)
      return httpResponse(200, res)
    } catch (error) {
      logger('error', ['Error uploading statistics object to MongoDB', 'system', stat.system, 'error', error.toString()], context)
      return httpResponse(500, error)
    }
  }

  if (req.method.toUpperCase() === 'GET') {
    const { system } = req.params
    if (!system) return httpResponse(400, 'Please provide a system name')
    logger('info', ['Fetching statistics for system', system], context)
    logger('info', ['First fetching collections/system names to see that the collection/system exists'], context)
    try {
      const db = await statDb()
      const collections = await db.listCollections().toArray()
      logger('info', [`Successfully fetched collections/system names - Length: ${collections.length}`, 'Mapping to only collection names'], context)
      const collectionNames = collections.map((collection) => collection.name)
      logger('info', [`Successfully mapped collections to only collection names - Length: ${collectionNames.length}`], context)
      if (!collectionNames.includes(system)) {
        logger('error', [`System "${system}" not found in collections`], context)
        return httpResponse(404, `System "${system}" not found`)
      }
      logger('info', [`System "${system}" found in collections - fetchin all documents for system`], context)
      const collection = db.collection(system)

      // Check query params - if count return only the count of documents, if filter - apply filter to the query
      const { filter, count, select } = req.query

      let queryFilter = {}
      if (filter) {
        queryFilter = parseQueryFilter(filter) // welcome to the rabbit hole
      }
      // Default projection
      let projection = {
        _id: 1,
        system: 1,
        engine: 1,
        createdTimestamp: 1,
        county: 1,
        company: 1,
        department: 1,
        description: 1,
        projectId: 1,
        externalId: 1,
        type: 1
      }
      if (select) {
        if (select.trim() === 'all') { // Cannot use * due to azure waf (web application firewall)
          projection = {}
        } else {
          projection = select.split(',').reduce((acc, prop) => {
            acc[prop.trim()] = 1
            return acc
          }, {})
        }
      }
      const stats = count === 'true' ? await collection.countDocuments(queryFilter) : await collection.find(queryFilter).project(projection).toArray()
      logger('info', [`Successfully fetched all documents for system "${system}" - Length: ${stats.length || stats}`, `count: ${count === 'true'}`, `select: ${select || 'default'}`], context)
      return httpResponse(200, stats)
    } catch (error) {
      logger('error', ['Error fetching stats for system', error.toString()], context)
      return httpResponse(500, error)
    }
  }
}
