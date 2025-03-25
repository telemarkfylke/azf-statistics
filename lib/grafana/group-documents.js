module.exports = (results) => {
  return results.reduce((acc, obj) => {
    const timestamp = new Date(obj.timestamp)
    const minuteKey = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), timestamp.getHours(), timestamp.getMinutes()).toISOString()
    const countKey = Object.keys(obj)[1]

    const accObj = acc.find(o => o.timestamp === minuteKey && Object.keys(o).includes(countKey))
    if (accObj) {
      accObj[countKey]++
      return acc
    }

    acc.push({
      timestamp: minuteKey,
      [countKey]: obj[countKey]
    })

    return acc
  }, [])
}
