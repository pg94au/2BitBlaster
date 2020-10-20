"use strict";

var debug = require('debug')('Blaster:Actor');
const { v4: uuidv4 } = require('uuid');

var Direction = require('./devices/Direction');

var Actor = function(world, startX, startY) {
    debug('Actor constructor');
    this._id = uuidv4();
    this._world = world;
    this._x = startX;
    this._y = startY;
    this._active = true;
};

Actor.prototype.getId = function() {
    return this._id;
};

Actor.prototype.move = function(direction) {
    if (direction & Direction.Up) {
        this._y--;
    }
    if (direction & Direction.Down) {
        this._y++;
    }
    if (direction & Direction.Left) {
        this._x--;
    }
    if (direction & Direction.Right) {
        this._x++;
    }
};

Actor.prototype.getCoordinates = function() {
    return {x: this._x, y: this._y};
};

Actor.prototype.getZIndex = function() {
    throw Error('Must implement getZIndex');
};

Actor.prototype.hitBy = function(actor, damage) {
    debug('Actor.hitBy ' + actor + ' for ' + damage);
    // By default, an actor isn't affected by hits.
    return false;
};

Actor.prototype.tick = function() {
    debug('Actor.tick');
};

/*
Return: {
    name: <root name of sprite sheet image>,
    numberOfFrames: <number of frames in sprite sheet>,
    frameWidth: <width in pixels of each sprite frame>,
    currentFrame: <current frame to be displayed (indexed from zero)>
}
 */
Actor.prototype.getImageDetails = function() {
    throw new Error('Must implement getImageDetails');
};

Actor.prototype.isActive = function() {
    debug('Actor.isActive: ' + this._active);
    return this._active;
};

module.exports = Actor;