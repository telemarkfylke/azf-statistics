module.exports = {
  mongoDB: {
    statisticsConnectionString: process.env.MONGO_STATISTICS_CONNECTION_STRING ?? 'tullball',
    statisticsDatabase: process.env.MONGO_DB_STATISTICS_DATABASE ?? 'tulliballa'
  },
  defaultCounty: process.env.DEFAULT_COUNTY || 'fylke'
}
