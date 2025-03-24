// Simple http response handler, handles axios error as well as plain js errors
module.exports = (statusCode, data) => {
  if (!statusCode) throw new Error('Missing required parameter "statusCode"')
  if (!data) throw new Error('Missing required parameter "data"')
  if (statusCode === 200) return { status: 200, body: data }

  const error = data.response?.data || data.stack || data.toString()
  const message = data.toString()
  return { status: statusCode, body: { message, data: error } }
}
