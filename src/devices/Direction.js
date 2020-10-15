"use strict";

var Enum = require('enum');

var Direction = new Enum(
    ['None', 'Up', 'Down', 'Left', 'Right']
);

module.exports = Direction;
