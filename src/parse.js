'use strict'

const check = require('check-types')
const walk = require('./walk')
const events = require('./events')

module.exports = parse

/**
 * Public function `parse`.
 *
 * Returns a promise and asynchronously parses a stream of JSON data. If
 * there are no errors, the promise is resolved with the parsed data. If
 * errors occur, the promise is rejected with the first error.
 *
 * @param stream:   Readable instance representing the incoming JSON.
 *
 * @option reviver: Transformation function, invoked depth-first.
 *
 * @option discard: The number of characters to process before discarding
 *          them to save memory. The default value is `16384`.
 **/
function parse (stream, options) {
  let resolve, reject, scopeKey

  options = options || {}
  const reviver = options.reviver

  try {
    check.assert.maybe.function(reviver, 'Invalid reviver option')
  } catch (err) {
    return Promise.reject(err)
  }

  const emitter = walk(stream, options)

  const scopes = []
  const errors = []

  emitter.on(events.array, array)
  emitter.on(events.object, object)
  emitter.on(events.property, property)
  emitter.on(events.string, value)
  emitter.on(events.number, value)
  emitter.on(events.literal, value)
  emitter.on(events.endArray, endScope)
  emitter.on(events.endObject, endScope)
  emitter.on(events.end, end)
  emitter.on(events.error, error)

  return new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  function array () {
    if (errors.length > 0) {
      return
    }

    beginScope([])
  }

  function beginScope (parsed) {
    if (errors.length > 0) {
      return
    }

    if (scopes.length > 0) {
      value(parsed)
    }

    scopes.push(parsed)
  }

  function value (v) {
    if (errors.length > 0) {
      return
    }

    if (scopes.length === 0) {
      return scopes.push(v)
    }

    const scope = scopes[scopes.length - 1]

    if (scopeKey) {
      scope[scopeKey] = v
      scopeKey = null
    } else {
      scope.push(v)
    }
  }

  function object () {
    if (errors.length > 0) {
      return
    }

    beginScope({})
  }

  function property (name) {
    if (errors.length > 0) {
      return
    }

    scopeKey = name
  }

  function endScope () {
    if (errors.length > 0) {
      return
    }

    if (scopes.length > 1) {
      scopes.pop()
    }
  }

  function end () {
    if (errors.length > 0) {
      return reject(errors[0])
    }

    if (reviver) {
      scopes[0] = transform(scopes[0], '')
    }

    resolve(scopes[0])
  }

  function transform (obj, key) {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(childKey => {
        obj[childKey] = transform(obj[childKey], childKey)
      })
    }

    return reviver(key, obj)
  }

  function error (e) {
    errors.push(e)
  }
}

