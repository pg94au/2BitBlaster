var debug = require('debug')('Blaster:Star');
var util = require('util');
var _ = require('underscore');

var Actor = require('./Actor');
var Direction = require('./devices/Direction');
var Point = require('./Point').Point;

function Star(world, startingPoint) {
    debug('Star constructor');
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    this._world = world;

    Actor.apply(this, [world, startingPoint]);

    this._flashRate = _.random(5, 10);
    this._flashCounter = 0;
    this._frameIndices = [];
    this._currentFrame = 0;

    var startFrame = _.random(0, 2);
    var endFrame = _.random(startFrame, 2);

    for (var i = startFrame; i <= endFrame; i++) {
        this._frameIndices.push(i);
    }
    for (var i = endFrame; i >= startFrame; i--) {
        this._frameIndices.push(i);
    }
}

util.inherits(Star, Actor);

Star.prototype.getImageDetails = function() {
    return {
        name: 'star',
        numberOfFrames: 3,
        frameWidth: 7,
        currentFrame: this._frameIndices[this._currentFrame]
    };
};

Star.prototype.getZIndex = function() {
    return 0;
};

Star.prototype.tick = function() {
    debug('Star.tick');
    var self = this;

    Star.super_.prototype.tick.call(this);

    _.times(1, function() { Star.super_.prototype.move.call(self, Direction.Down) });

    if (this._y > this._world.getDimensions().height) {
        // When the star leaves the world, it becomes inactive.
        debug('De-activating star ' + this._id);
        this._active = false;
    }

    // Make the star sparkle.
    //this._currentFrame = (this._currentFrame + 1) % 2;
    this._flashCounter = (this._flashCounter + 1) % this._flashRate;

    if (this._flashCounter == 0) {
        this._currentFrame = (this._currentFrame + 1) % this._frameIndices.length;
    }
};

module.exports = Star;