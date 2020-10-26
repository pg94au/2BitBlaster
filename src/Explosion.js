/**
 * Created by paul on 2/6/2016.
 */
var debug = require('debug')('Blaster:Explosion');
var util = require('util');

var Actor = require('./Actor');
var ExplosionProperties = require('./ExplosionProperties').ExplosionProperties;
var ImageDetails = require('./ImageDetails').ImageDetails;

function Explosion(explosionProperties, audioPlayer, world, startingPoint) {
    debug('Explosion constructor for ' + explosionProperties.imageName);
    Actor.apply(this, [world, startingPoint]);

    if (explosionProperties === undefined) {
        throw new Error('explosionProperties cannot be undefined');
    }
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    this._explosionProperties = explosionProperties;

    this._audioPlayer = audioPlayer;

    this._currentFrame = 0;
    this._firstTick = true;
}

util.inherits(Explosion, Actor);

Explosion.prototype.getImageDetails = function() {
    return new ImageDetails(
        this._explosionProperties.imageName,
        this._explosionProperties.numberOfFrames,
        this._explosionProperties.frameWidth,
        Math.floor(this._currentFrame)
    );
};

Explosion.prototype.getZIndex = function() {
    return 30;
};

Explosion.prototype.tick = function () {
    debug('Explosion.tick');
    var self = this;

    Explosion.super_.prototype.tick.call(this);

    if (this._firstTick) {
        if (this._explosionProperties.soundName) {
            this._audioPlayer.play(this._explosionProperties.soundName);
        }
        this._firstTick = false;
    }

    this._currentFrame = this._currentFrame + this._explosionProperties.frameSpeed;

    if (this._currentFrame >= this._explosionProperties.numberOfFrames) {
        // When the explosion has run its course, de-active it.
        debug('De-activating explosion ' + this._id);
        this._active = false;
    }
};

module.exports = Explosion;