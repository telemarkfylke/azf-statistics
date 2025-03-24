const { logger, logConfig } = require('@vtfk/logger')

module.exports = ({ start, end } = {}, context) => {
  logConfig({
    prefix: 'azf-statistics - Grafana - Validate'
  })

  if (!start) {
    logger('error', ['Missing "start" query parameter'], context)
    return {
      result: false,
      message: 'Please provide a start query parameter'
    }
  }

  if (!end) {
    logger('error', ['Missing "end" query parameter'], context)
    return {
      result: false,
      message: 'Please provide an end query parameter'
    }
  }

  const startDate = new Date(start)
  if (start.toString() === 'Invalid Date') {
    logger('error', ['Invalid "start" query parameter'], context)
    return {
      result: false,
      message: 'Invalid start query parameter'
    }
  }

  const endDate = new Date(end)
  if (end.toString() === 'Invalid Date') {
    logger('error', ['Invalid "end" query parameter'], context)
    return {
      result: false,
      message: 'Invalid end query parameter'
    }
  }

  if (startDate > endDate) {
    logger('error', ['"start" query parameter is after "end" query parameter'], context)
    return {
      result: false,
      message: 'start query parameter is after end query parameter'
    }
  }

  return {
    result: true
  }
}
