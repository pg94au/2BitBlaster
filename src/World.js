"use strict";

var _ = require('underscore');
var debug = require('debug')('Blaster:World');
var Enemy = require('./enemies/Enemy');
var Explosion = require('./Explosion');
var Player = require('./Player');

var World = function(width, height, scoreCounter) {
    debug('World: constructor');
    if (width === undefined) {
        throw Error('width cannot be undefined');
    }
    if (height === undefined) {
        throw Error('height cannot be undefined');
    }
    if (scoreCounter === undefined) {
        throw Error('scoreCounter cannot be undefined');
    }

    this._actors = [];
    this._texts = [];
    this._width = width;
    this._height = height;
    this._scoreCounter = scoreCounter;
};

World.prototype.getDimensions = function() {
    return { width: this._width, height: this._height };
};

World.prototype.addActor = function(actor) {
    debug('World.addActor: %o', actor);
    if (_.find(this._actors, function(existing) { return existing.getId() == actor.getId()})) {
        throw new Error('Cannot add same actor twice.');
    }
    this._actors.push(actor);
};

World.prototype.addText = function(text) {
    debug('World.addText: %o', text);
    if (_.find(this._texts, function(existing) { return existing.id == text.id})) {
        throw new Error('Cannot add same text twice.');
    }
    this._texts.push(text);
};

World.prototype.getActors = function() {
    return this._actors;
};

World.prototype.getActiveEnemies = function() {
    var activeEnemies = [];
    for (var i=0; i < this._actors.length; i++) {
        if (this._actors[i].isActive()) {
            if (this._actors[i] instanceof Enemy) {
                activeEnemies.push(this._actors[i]);
            }
        }
    }

    return activeEnemies;
};

World.prototype.getActiveExplosions = function() {
    var activeExplosions = [];
    for (var i=0; i < this._actors.length; i++) {
        if (this._actors[i].isActive()) {
            if (this._actors[i] instanceof Explosion) {
                activeExplosions.push(this._actors[i]);
            }
        }
    }

    return activeExplosions;
};

World.prototype.getPlayer = function() {
    var player = null;
    for (var i=0; i < this._actors.length; i++) {
        if (this._actors[i] instanceof Player) {
            player = this._actors[i];
        }
    }

    return player;
};

World.prototype.getScoreCounter = function() {
   return this._scoreCounter;
};

World.prototype.getTexts = function() {
    return this._texts;
};

World.prototype.tick = function() {
    debug('World.tick');
    for (var i=0; i < this._actors.length; i++) {
        var actor = this._actors[i];
        debug('World.tick: ticking %o', actor);
        actor.tick();
    }
    //TODO: Texts could be ticked as well, so that they can animate if necessary.
    this.cleanUp();
};

World.prototype.cleanUp = function() {
    debug('World.cleanUp: before is %o', this._actors);

    this._actors =  _.filter(this._actors, function(actor) { return actor.isActive(); });
    this._texts = _.filter(this._texts, function(text) { return text.active; });

    debug('World.cleanUp: after is %o', this._actors);
};

module.exports = World;
