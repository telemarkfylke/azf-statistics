const { parseQueryFilter } = require('../lib/parse-query')

describe('ParseQueryFilter runs as expected when', () => {
  test('given a simple eq filter with one statement', () => {
    const filter = "name eq 'John Doe'"
    const result = parseQueryFilter(filter)
    expect(result).toEqual({ $and: [{ name: { $eq: 'John Doe' } }] })
  })
  test('given a simple or filter with two statements, where one value has number', () => {
    const filter = "name eq 'John Doe' or age ne 42"
    const result = parseQueryFilter(filter)
    expect(result).toEqual({ $or: [{ name: { $eq: 'John Doe' } }, { age: { $ne: 42 } }] })
  })
  test('given a simple or filter with two statements, where both values are strings', () => {
    const filter = "name eq 'John Doe' or age ne '42'"
    const result = parseQueryFilter(filter)
    expect(result).toEqual({ $or: [{ name: { $eq: 'John Doe' } }, { age: { $ne: '42' } }] })
  })
  test('given a not filter with a nested or inside, and string eq without single quotes', () => {
    const filter = '(name eq Petter or hobby ne pizza) nor (age eq 42)'
    const result = parseQueryFilter(filter)
    expect(result).toEqual({
      $nor: [
        {
          $or: [
            { name: { $eq: 'Petter' } },
            { hobby: { $ne: 'pizza' } }
          ]
        },
        {
          $and: [
            { age: { $eq: 42 } }
          ]
        }
      ]
    })
  })
  test('given a triple nested filter with boolean and null', () => {
    const filter = '(createdTimestamp gt 2024-02-24 and (duplicate eq true or stilig eq null)) nor (name eq Petter or hobby ne pizza)'
    const result = parseQueryFilter(filter)
    expect(result).toEqual({
      $nor: [
        {
          $and: [
            { createdTimestamp: { $gt: '2024-02-24' } },
            {
              $or: [
                { duplicate: { $eq: true } },
                { stilig: { $eq: null } }
              ]
            }
          ]
        },
        {
          $or: [
            { name: { $eq: 'Petter' } },
            { hobby: { $ne: 'pizza' } }
          ]
        }
      ]
    })
  })
  test('given a triple nested filter with values \'false\' (should be string) and \'null\' (should also be string)', () => {
    const filter = "(createdTimestamp gt 2024-02-24 and (duplicate eq 'false' or stilig eq 'null')) nor (name eq Petter or hobby ne pizza)"
    const result = parseQueryFilter(filter)
    expect(result).toEqual({
      $nor: [
        {
          $and: [
            { createdTimestamp: { $gt: '2024-02-24' } },
            {
              $or: [
                { duplicate: { $eq: 'false' } },
                { stilig: { $eq: 'null' } }
              ]
            }
          ]
        },
        {
          $or: [
            { name: { $eq: 'Petter' } },
            { hobby: { $ne: 'pizza' } }
          ]
        }
      ]
    })
  })
  test('given a triple nested filter with values \'tipp or tapp\' ("or" should be treated as string and not logical operator) and \'and i saus\' ("and" should be treated as string and not logical operator)', () => {
    const filter = "(createdTimestamp gt 2024-02-24 and (stuff eq 'tipp or tapp' or stilig eq null)) nor (dish eq 'and i saus' or hobby ne pizza)"
    const result = parseQueryFilter(filter)
    expect(result).toEqual({
      $nor: [
        {
          $and: [
            { createdTimestamp: { $gt: '2024-02-24' } },
            {
              $or: [
                { stuff: { $eq: 'tipp or tapp' } },
                { stilig: { $eq: null } }
              ]
            }
          ]
        },
        {
          $or: [
            { dish: { $eq: 'and i saus' } },
            { hobby: { $ne: 'pizza' } }
          ]
        }
      ]
    })
  })
  test('given a triple nested filter with property names \'tipp or tapp\' ("or" should be treated as string and not logical operator) and \'and i saus\' ("and" should be treated as string and not logical operator)', () => {
    const filter = "(createdTimestamp gt 2024-02-24 and ('tipp or tapp' eq true or stilig eq null)) nor ('and i saus' lt 4 or hobby ne pizza)"
    const result = parseQueryFilter(filter)
    expect(result).toEqual({
      $nor: [
        {
          $and: [
            { createdTimestamp: { $gt: '2024-02-24' } },
            {
              $or: [
                { 'tipp or tapp': { $eq: true } },
                { stilig: { $eq: null } }
              ]
            }
          ]
        },
        {
          $or: [
            { 'and i saus': { $lt: 4 } },
            { hobby: { $ne: 'pizza' } }
          ]
        }
      ]
    })
  })
})

describe('ParseQueryFilter throws error when', () => {
  test('using several logical operators on the same level', () => {
    const filter = "name eq 'John Doe' and or age ne 42"
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('You must use parenthesis when using multiple logical operators in a filter')
  })
  test('using several logical operators on the same level in a nested level', () => {
    const filter = "name eq 'John Doe' and (age ne 42 or or hobby eq 'pizza' and gender eq lizard)"
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('You must use parenthesis when using multiple logical operators in a filter')
  })
  test('a statement is malformed', () => {
    const filter = "name eq and 'John Doe'"
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('Statement must be on the form <property> <operator> <value>')
  })
  test('a nested statement is malformed', () => {
    const filter = "test eq true and (name eq 'John Doe' or dust)"
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('Statement must be on the form <property> <operator> <value>')
  })
  test('using unknown logical operator', () => {
    const filter = "test eq true maybe name eq 'John Doe'"
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('You must use exactly one operator in a statement')
  })
  test('property name has whitespace and not using single quotes', () => {
    const filter = "name eq Gunnar or gubba noa eq 'jauda sauda'"
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('Property names with whitespace must be enclosed in single quotes')
  })
  test('value has whitespace and not using single quotes', () => {
    const filter = "name eq Gunnar or 'gubba noa' eq jauda sauda"
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('Values with whitespace must be enclosed in single quotes')
  })
  test('using unknown operator', () => {
    const filter = "name eq Gunnar or ('gubba noa' eq 'jauda sauda' and hobby like tøfler)"
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('Statement must be on the form <property> <operator> <value>')
  })
  test('using empty filter', () => {
    const filter = ''
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('Filter must contain at least one statement or one sub filter')
  })
  test('using empty sub filter', () => {
    const filter = 'name eq gunnar and'
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('Values with whitespace must be enclosed in single quotes')
  })
  test('using empty nested sub filter', () => {
    const filter = 'name eq gunnar and (hobby eq pizza or)'
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('Values with whitespace must be enclosed in single quotes')
  })
  test('using several operators in the same statement', () => {
    const filter = 'name eq gunnar and (hobby eq pizza ne sykling)'
    const shouldThrow = () => parseQueryFilter(filter)
    expect(shouldThrow).toThrow('You must use exactly one operator in a statement')
  })
})
