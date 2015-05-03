/*globals require, module */

'use strict';

var util, Readable, check;

util = require('util');
Readable = require('stream').Readable;
check = require('check-types');

util.inherits(JsonStream, Readable);

function JsonStream (read) {
    // https://nodejs.org/api/stream.html#stream_class_stream_readable_1

    if (check.not.instance(this, JsonStream)) {
        return new JsonStream(read);
    }

    check.assert.function(read, 'Invalid read implementation');

    this._read = function () {
        // TODO: Check it is okay to ignore size argument

        read();
    };

    return Readable.call(this, { encoding: 'utf8' });
}

