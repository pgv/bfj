'use strict'

const assert = require('chai').assert
const path = require('path')
const fs = require('fs')

const modulePath = '../src'

suite('integration:', () => {
  let log

  setup(() => {
    log = {}
  })

  teardown(() => {
    log = undefined
  })

  test('require does not throw', () => {
    assert.doesNotThrow(() => {
      require(modulePath)
    })
  })

  test('require returns object', () => {
    assert.isObject(require(modulePath))
  })

  suite('require:', () => {
    let bfj

    setup(() => {
      bfj = require(modulePath)
    })

    teardown(() => {
      bfj = undefined
    })

    test('walk function is exported', () => {
      assert.isFunction(bfj.walk)
    })

    test('walk expects one argument', () => {
      assert.lengthOf(bfj.walk, 2)
    })

    test('parse function is exported', () => {
      assert.isFunction(bfj.parse)
    })

    test('parse expects two arguments', () => {
      assert.lengthOf(bfj.parse, 2)
    })

    test('read function is exported', () => {
      assert.isFunction(bfj.read)
    })

    test('read expects two arguments', () => {
      assert.lengthOf(bfj.read, 2)
    })

    test('eventify function is exported', () => {
      assert.isFunction(bfj.eventify)
    })

    test('eventify expects two arguments', () => {
      assert.lengthOf(bfj.eventify, 2)
    })

    test('streamify function is exported', () => {
      assert.isFunction(bfj.streamify)
    })

    test('streamify expects two arguments', () => {
      assert.lengthOf(bfj.streamify, 2)
    })

    test('stringify function is exported', () => {
      assert.isFunction(bfj.stringify)
    })

    test('stringify expects two arguments', () => {
      assert.lengthOf(bfj.stringify, 2)
    })

    test('write function is exported', () => {
      assert.isFunction(bfj.write)
    })

    test('write expects two arguments', () => {
      assert.lengthOf(bfj.write, 3)
    })

    test('events are exported', () => {
      assert.deepEqual(bfj.events, require('../src/events'))
    })

    suite('read object:', () => {
      let failed, file, result, error

      setup(() => {
        failed = false
        file = path.join(__dirname, 'data.json')
        fs.writeFileSync(file, JSON.stringify({
          foo: [ 'b', 'a', 'r' ],
          baz: null,
          qux: 3.14159265359e42
        }, null, '\t'))
        return bfj.read(file)
          .then(res => {
            result = res
          })
          .catch(err => {
            failed = true
            error = err
          })
      })

      teardown(() => {
        fs.unlinkSync(file)
        failed = file = result = error = undefined
      })

      test('result was correct', () => {
        assert.isFalse(failed)
        assert.isUndefined(error)
        assert.isObject(result)
        assert.lengthOf(Object.keys(result), 3)
        assert.isArray(result.foo)
        assert.lengthOf(result.foo, 3)
        assert.strictEqual(result.foo[0], 'b')
        assert.strictEqual(result.foo[1], 'a')
        assert.strictEqual(result.foo[2], 'r')
        assert.isNull(result.baz)
        assert.strictEqual(result.qux, 3.14159265359e42)
      })
    })

    suite('read value:', () => {
      let failed, file, result, error

      setup(() => {
        failed = false
        file = path.join(__dirname, 'data.json')
        fs.writeFileSync(file, '"foo"')
        return bfj.read(file)
          .then(res => {
            result = res
          })
          .catch(err => {
            failed = true
            error = err
          })
      })

      teardown(() => {
        fs.unlinkSync(file)
        failed = file = result = error = undefined
      })

      test('result was correct', () => {
        assert.isFalse(failed)
        assert.isUndefined(error)
        assert.strictEqual(result, 'foo')
      })
    })

    suite('read error:', () => {
      let failed, file, result, error

      setup(() => {
        failed = false
        file = path.join(__dirname, 'data.json')
        fs.writeFileSync(file, '"foo" "bar"')
        return bfj.read(file)
          .then(res => result = res)
          .catch(err => {
            failed = true
            error = err
          })
      })

      teardown(() => {
        fs.unlinkSync(file)
        failed = file = result = error = undefined
      })

      test('result was correct', () => {
        assert.isTrue(failed)
        assert.isUndefined(result)
        assert.instanceOf(error, Error)
      })
    })

    suite('stringify value:', () => {
      let result

      setup(() => {
        return bfj.stringify(new Promise(resolve => {
          setTimeout(resolve.bind(null, 'foo\t"\nbar'), 20)
        }))
        .then(res => result = res)
      })

      teardown(() => {
        result = undefined
      })

      test('result was correct', () => {
        assert.strictEqual(result, '"foo\\t\\"\\nbar"')
      })
    })

    suite('write object:', () => {
      let failed, file, result

      setup(() => {
        failed = false
        file = path.join(__dirname, 'data.json')
        return bfj.write(
          file,
          { foo: [ 'b', 'a', 'r' ], baz: null, qux: 3.14159265359e42 }
        )
        .then(() => {
          result = fs.readFileSync(file, { encoding: 'utf8' })
        })
        .catch(error => {
          failed = true
          result = error
        })
      })

      teardown(() => {
        fs.unlinkSync(file)
        failed = file = result = undefined
      })

      test('did not fail', () => {
        assert.isFalse(failed)
      })

      test('result was correct', () => {
        assert.strictEqual(result, '{"foo":["b","a","r"],"baz":null,"qux":3.14159265359e+42}')
      })
    })
  })
})

