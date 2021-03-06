'use strict'

const streamify = require('./streamify')

module.exports = stringify

/**
 * Public function `stringify`.
 *
 * Returns a promise and asynchronously serialises a data structure to a
 * JSON string. Sanely handles promises, buffers, maps and other iterables.
 *
 * @param data:     The data to transform
 *
 * @option space:   Indentation string, or the number of spaces
 *          to indent each nested level by.
 *
 * @option promises:  'resolve' or 'ignore', default is 'resolve'.
 *
 * @option buffers:   'toString' or 'ignore', default is 'toString'.
 *
 * @option maps:    'object' or 'ignore', default is 'object'.
 *
 * @option iterables: 'array' or 'ignore', default is 'array'.
 *
 * @option circular:  'error' or 'ignore', default is 'error'.
 **/
function stringify (data, options) {
  let resolve, reject

  const stream = streamify(data, options)
  let json = ''

  stream.on('data', read)
  stream.on('end', end)
  stream.on('dataError', error)

  return new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  function read (chunk) {
    json += chunk
  }

  function end () {
    resolve(json)
  }

  function error (e) {
    reject(e)
  }
}

