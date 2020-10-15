"use strict";

var Enum = require('enum');

var Action = new Enum(
    ['Move', 'Fire']
);

module.exports = Action;
