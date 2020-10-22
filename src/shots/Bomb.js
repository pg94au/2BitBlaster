var _ = require('underscore');
var debug = require('debug')('Blaster:Bomb');
var util = require('util');

var Direction = require('../devices/Direction');
var HitArbiter = require('../HitArbiter').HitArbiter;
var HitResult = require('../HitResult').HitResult;
var Shot = require('./Shot');

function Bomb(audioPlayer, world, startX, startY) {
    debug('Bomb constructor');
    Shot.apply(this, [world, startX, startY]);

    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    this._audioPlayer = audioPlayer;

    this.currentFrame = 0;
    this._firstTick = true;
}

util.inherits(Bomb, Shot);

Bomb.prototype.getCollisionMask = function() {
    return [{
        left: -5,
        right: 5,
        top: -5,
        bottom: 5
    }];
};

Bomb.prototype.getDamageAgainst = function(actor) {
    return 1;
};

Bomb.prototype.getImageDetails = function() {
    return {
        name: 'bomb',
        numberOfFrames: 4,
        frameWidth: 11,
        currentFrame: this.currentFrame
    };
};

Bomb.prototype.tick = function () {
    debug('Bomb.tick');
    var self = this;

    Bomb.super_.prototype.tick.call(this);

    if (this._firstTick) {
        this._audioPlayer.play('bomb_drop');
        this._firstTick = false;
    }

    this.currentFrame = (this.currentFrame + 1) % 4;

    var speed = 10;
    for (var step = 0; step < speed; step++) {
        this._y++;

        if (this._y > this._world.getDimensions().height) {
            // When the bomb leaves the world, it becomes inactive.
            debug('De-activating bomb ' + this._id);
            this._active = false;
        }
        else {
            // Check if this bomb has collided with any active enemies.
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

module.exports = Bomb;
