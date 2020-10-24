var _ = require('underscore');
var debug = require('debug')('Blaster:Bullet');
var util = require('util');

var Direction = require('../devices/Direction');
var HitArbiter = require('../HitArbiter').HitArbiter;
var HitResult = require('../HitResult').HitResult;
var Point = require('../Point').Point;
var Shot = require('./Shot');

function Bullet(audioPlayer, world, startingPoint) {
    debug('Bullet constructor');
    Shot.apply(this, [world, startingPoint]);

    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    this._audioPlayer = audioPlayer;

    this.currentFrame = 0;
    this._firstTick = true;
}

util.inherits(Bullet, Shot);

Bullet.prototype.getCollisionMask = function() {
    return [{
        left: -5,
        right: 5,
        top: -5,
        bottom: 5
    }];
};

Bullet.prototype.getDamageAgainst = function(actor) {
    return 1;
};

Bullet.prototype.getImageDetails = function() {
    return {
        name: 'bullet',
        numberOfFrames: 4,
        frameWidth: 11,
        currentFrame: this.currentFrame
    };
};

Bullet.prototype.tick = function () {
    debug('Bullet.tick');
    var self = this;

    Bullet.super_.prototype.tick.call(this);

    if (this._firstTick) {
        this._audioPlayer.play('bullet_fire');
        this._firstTick = false;
    }

    this.currentFrame = (this.currentFrame + 1) % 4;

    var speed = 10;
    for (var step = 0; step < speed; step++) {
        this._location = this._location.up();

        if (this._location.y < 0) {
            // When the bullet leaves the world, it becomes inactive.
            debug('De-activating bullet ' + this._id);
            this._active = false;
        }
        else {
            var hitArbiter = new HitArbiter(self);

            // Check if this bullet has collided with any active enemies.
            var activeEnemies = self._world.getActiveEnemies();
            activeEnemies.forEach(function(enemy) {
                //TODO: Do something if the hit is ineffective.
                if (self._active) {
                    if (hitArbiter.attemptToHit(enemy) !== HitResult.Miss) {
                        self._active = false;
                    }
                }
            });
        }

        if (!this._active) {
            break;
        }
    }
};

module.exports = Bullet;
