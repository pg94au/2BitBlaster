/**
 * Created by paul on 2/6/2016.
 */
var debug = require('debug')('Blaster:Explosion');
var util = require('util');

var Actor = require('./Actor');

function Explosion(explosionProperties, audioPlayer, world, startX, startY) {
    debug('Explosion constructor for ' + explosionProperties.imageName);
    Actor.apply(this, [world, startX, startY]);

    if (explosionProperties === undefined) {
        throw new Error('explosionProperties cannot be undefined');
    }
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    this._imageName = explosionProperties.imageName;
    this._numberOfFrames = explosionProperties.numberOfFrames;
    this._frameWidth = explosionProperties.frameWidth;
    this._frameSpeed = explosionProperties.frameSpeed;
    this._soundName = explosionProperties.soundName;

    this._audioPlayer = audioPlayer;

    this._currentFrame = 0;
    this._firstTick = true;
}

util.inherits(Explosion, Actor);

Explosion.prototype.getImageDetails = function() {
    return {
        name: this._imageName,
        numberOfFrames: this._numberOfFrames,
        frameWidth: this._frameWidth,
        currentFrame: Math.floor(this._currentFrame)
    };
};

Explosion.prototype.getZIndex = function() {
    return 30;
};

Explosion.prototype.tick = function () {
    debug('Explosion.tick');
    var self = this;

    Explosion.super_.prototype.tick.call(this);

    if (this._firstTick) {
        if (this._soundName) {
            this._audioPlayer.play(this._soundName);
        }
        this._firstTick = false;
    }

    this._currentFrame = this._currentFrame + this._frameSpeed;

    if (this._currentFrame >= this._numberOfFrames) {
        // When the explosion has run its course, de-active it.
        debug('De-activating explosion ' + this._id);
        this._active = false;
    }
};

module.exports = Explosion;