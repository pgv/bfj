/*globals require, module */

'use strict';

var events, JsonError, terminators;

events = require('events');
JsonError = require('JsonError');

terminators = {
    object: '}',
    array: ']'
};

module.exports = parse;

function parse (json) {
    var emitter, index, line, column, scopes, handlers;

    emitter = new events.EventEmitter;
    index = 0;
    line = column = 1;
    scopes = [];
    handlers = {
        array: value,
        object: property
    };

    setImmediate(value);

    return result;

    function value () {
        ignoreWhitespace();

        switch (next()) {
            case '{':
                return setImmediate(object);
            case '[':
                return setImmediate(array);
            case '"':
                return setImmediate(string);
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                return setImmediate(number);
            default:
                return setImmediate(literal);
        }
    }

    function ignoreWhitespace () {
        while (true) {
            switch (next()) {
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                    continue;
            }

            break;
        }
    }

    function next () {
        if (index === json.length) {
            return end();
        }

        if (character() === '\n') {
            line += 1;
            column = 1;
        } else {
            column += 1;
        }

        return character();
    }

    function character () {
        return json[index];
    }

    function end () {
        while (scopes.length > 0) {
            error('EOF', terminators[scopes.pop()]);
        }

        emitter.emit('end');
    }

    function error (actual, expected) {
        emitter.emit('error', new JsonError(actual, expected, line, column));
    }

    function object () {
        scope('object');
        setImmediate(name);
    }

    function scope (type) {
        emitter.emit(type);
        scopes.push(type);
    }

    function name () {
        parseString('property');

        ignoreWhitespace();
        check(next(), ':');

        setImmediate(value);
    }

    function parseString (event) {
        var string = '';

        ignoreWhitespace();
        check(next(), '"');

        while (character() !== '"') {
            string += next();
        }

        emitter.emit(event, string);
    }

    function check (character, expected) {
        if (character !== expected) {
            error('`' + character + '`', expected);
        }
    }

    function array () {
        scope('array');
        setImmediate(value);
    }

    function string (event) {
        parseString('string');
    }

    function endValue () {
        var scope, character;

        ignoreWhitespace();

        if (scopes.length === 0) {
            setImmediate(value);
            return;
        }

        scope = scopes[scopes.length - 1];
        character = next();

        if (character === ',') {
            setImmediate(handlers[scope]);
            return;
        }

        check(character, terminators[scope]);
        setImmediate(endValue);
    }
}
