const handleAllSystems = require('../lib/grafana/handle-all-systems')
const handleSystem = require('../lib/grafana/handle-system')
const httpResponse = require('../lib/http-response')
const validation = require('../lib/grafana/validate-grafana-request')

module.exports = async function (context, req) {
  const { system } = req.params
  const { start, end } = req.query

  const { result, message } = validation(req.query, context)
  if (!result) {
    return httpResponse(400, message)
  }

  if (!system) {
    return await handleAllSystems(context, start, end)
  }

  return await handleSystem(context, system.trim(), start, end)
}
