const { logger, logConfig } = require('@vtfk/logger')

const getDate = (value) => {
  if (value.includes('T')) {
    return new Date(value)
  }

  return new Date(Number.parseInt(value))
}

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

  const startDate = getDate(start)
  if (startDate.toString() === 'Invalid Date') {
    logger('error', ['Invalid "start" query parameter'], context)
    return {
      result: false,
      message: 'Invalid start query parameter'
    }
  }

  const endDate = getDate(end)
  if (endDate.toString() === 'Invalid Date') {
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
    result: true,
    start: startDate.toISOString(),
    end: endDate.toISOString()
  }
}
