"use strict";

var debug = require('debug')('Blaster:Text');
var uuid = require('node-uuid');

var Text = function(content, font, color, startX, startY) {
    debug('Text constructor');
    this._id = uuid.v1();
    this._content = content;
    this._font = font;
    this._color = color;
    this._x = startX;
    this._y = startY;
    this._active = true;
};

Text.prototype.getId = function() {
    return this._id;
};

Text.prototype.getCoordinates = function() {
    return {x: this._x, y: this._y};
};

Text.prototype.tick = function() {
    debug('Text.tick');
};

Text.prototype.getContent = function() {
    return this._content;
};

Text.prototype.getColor = function() {
    return this._color;
};

Text.prototype.getFont = function() {
    return this._font;
};

Text.prototype.isActive = function() {
    debug('Text.isActive: ' + this._active);
    return this._active
};

module.exports = Text;
