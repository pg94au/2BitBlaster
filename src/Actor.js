"use strict";

var debug = require('debug')('Blaster:Actor');
const { v4: uuidv4 } = require('uuid');

var Direction = require('./devices/Direction').Direction;
var ImageDetails = require('./ImageDetails').ImageDetails;
var Point = require('./Point').Point;

var Actor = function(world, startCoordinates) {
    debug('Actor constructor');
    this._id = uuidv4();
    this._world = world;
    this._location = startCoordinates;
    this._active = true;
};

Actor.prototype.getId = function() {
    return this._id;
};

Actor.prototype.move = function(direction) {
    if (direction & Direction.Up) {
        this._location = this._location.up();
    }
    if (direction & Direction.Down) {
        this._location = this._location.down();
    }
    if (direction & Direction.Left) {
        this._location = this._location.left();
    }
    if (direction & Direction.Right) {
        this._location = this._location.right();
    }
};

Actor.prototype.getCoordinates = function() {
    return this._location;
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

Actor.prototype.getImageDetails = function() {
    throw new Error('Must implement getImageDetails');
};

Actor.prototype.isActive = function() {
    debug('Actor.isActive: ' + this._active);
    return this._active;
};

module.exports = Actor;
