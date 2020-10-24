var _ = require('underscore');
var debug = require('debug')('Blaster:Shrapnel');
var util = require('util');

var Direction = require('../devices/Direction');
var HitArbiter = require('../HitArbiter').HitArbiter;
var HitResult = require('../HitResult').HitResult;
var Point = require('../Point').Point;
var Shot = require('./Shot');

function Shrapnel(audioPlayer, world, startingPoint, trajectory) {
    debug('Shrapnel constructor');
    Shot.apply(this, [world, startingPoint]);

    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    this._audioPlayer = audioPlayer;
    if (trajectory === undefined) {
        throw new Error('trajectory cannot be undefined');
    }
    this._trajectory = trajectory;

    this.currentFrame = 0;
    this._firstTick = true;

    this._exactX = startingPoint.x;
    this._exactY = startingPoint.y;
}

util.inherits(Shrapnel, Shot);

Shrapnel.prototype.getCollisionMask = function() {
    return [{
        left: -5,
        right: 5,
        top: -5,
        bottom: 5
    }];
};

Shrapnel.prototype.getDamageAgainst = function(actor) {
    return 1;
};

Shrapnel.prototype.getImageDetails = function() {
    return {
        name: 'bomb',
        numberOfFrames: 4,
        frameWidth: 11,
        currentFrame: this.currentFrame
    };
};

Shrapnel.prototype.tick = function () {
    debug('Shrapnel.tick');
    var self = this;

    Shrapnel.super_.prototype.tick.call(this);

    if (this._firstTick) {
        this._audioPlayer.play('bomb_drop');
        this._firstTick = false;
    }

    this.currentFrame = (this.currentFrame + 1) % 4;

    var speed = 10;
    for (var step = 0; step < speed; step++) {
        this.moveOneStepInDefinedTrajectory();

        if (this._location.y > this._world.getDimensions().height) {
            // When this shrapnel piece leaves the world, it becomes inactive.
            debug('De-activating shrapnel ' + this._id);
            this._active = false;
        }
        else {
            // Check if this piece of shrapnel has collided with any active enemies.
            var player = self._world.getPlayer();
            if (player) {
                var hitArbiter = new HitArbiter(self);
                //TODO: Do something if the hit is ineffective.
                if (hitArbiter.attemptToHit(player) !== HitResult.Miss) {
                    self._active = false;
                }
            }
        }

        if (!this._active) {
            break;
        }
    }
};

Shrapnel.prototype.moveOneStepInDefinedTrajectory = function() {
    var trajectoryInRadians = this._trajectory * Math.PI  / 180;

    var xOffset = Math.cos(trajectoryInRadians);
    var yOffset = Math.sin(trajectoryInRadians);

    this._exactX += xOffset;
    this._exactY -= yOffset;

    this._location = new Point(Math.round(this._exactX), Math.round(this._exactY));
};

module.exports = Shrapnel;
