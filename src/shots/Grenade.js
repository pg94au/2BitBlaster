var _ = require('underscore');
var debug = require('debug')('Blaster:Grenade');
var util = require('util');

var Bounds = require('../Bounds').Bounds;
var Direction = require('../devices/Direction').Direction;
var Explosion = require('../Explosion');
var HitArbiter = require('../HitArbiter').HitArbiter;
var HitResult = require('../HitResult').HitResult;
var Point = require('../Point').Point;
var Shot = require('./Shot');
var Shrapnel = require('./Shrapnel');

function Grenade(audioPlayer, world, startingPoint) {
    debug('Grenade constructor');
    Shot.apply(this, [world, startingPoint]);

    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    this._audioPlayer = audioPlayer;

    this.currentFrame = 0;
    this._initialHeight = startingPoint.y;
    this._firstTick = true;
}

util.inherits(Grenade, Shot);

Grenade.prototype.getCollisionMask = function() {
    return [new Bounds(-12, 12, -12, 12)];
};

Grenade.prototype.getDamageAgainst = function(actor) {
    return 3;
};

Grenade.prototype.getImageDetails = function() {
    return {
        name: 'grenade',
        numberOfFrames: 24,
        frameWidth: 30,
        currentFrame: this.currentFrame
    };
};

Grenade.prototype.tick = function () {
    debug('Grenade.tick');
    var self = this;

    Grenade.super_.prototype.tick.call(this);

    if (this._firstTick) {
        this._audioPlayer.play('bomb_drop');
        this._firstTick = false;
    }

//    this.currentFrame = (this.currentFrame + 1) % 24;

    var speed = 5;
    for (var step = 0; step < speed; step++) {
        this._location = this._location.down();

        if (this._location.y > this._world.getDimensions().height) {
            // If the grenade leaves the world, it becomes inactive.
            debug('De-activating grenade ' + this._id);
            this._active = false;
        }
        else {
            // Check if this grenade has collided with any active enemies.
            var player = self._world.getPlayer();
            if (player) {
                var hitArbiter = new HitArbiter(self);
                //TODO: Do something if the hit is ineffective.
                if (hitArbiter.attemptToHit(player) !== HitResult.Miss) {
                    self._active = false;
                }
            }

            // If this grenade has fallen far enough, it explodes into shrapnel.
            var distanceCovered = this._location.y - this._initialHeight;
            if (distanceCovered >= 200) {
                self._active = false;

                //TODO: Add a small explosion here.
                var explosion = new Explosion(
                    {
                        imageName: 'grenade_explosion',
                        numberOfFrames: 7,
                        frameWidth: 50,
                        frameSpeed: 1.5,
                        soundName: 'saucer_explosion'
                    },
                    this._audioPlayer,
                    this._world,
                    this._location
                );
                this._world.addActor(explosion);

                var downShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 270);
                this._world.addActor(downShrapnel);

                var leftShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 250);
                this._world.addActor(leftShrapnel);

                var rightShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 290);
                this._world.addActor(rightShrapnel);
            }
            else {
                this.currentFrame = Math.round((distanceCovered / 200) * 24);
            }
        }


        if (!this._active) {
            break;
        }
    }
};

module.exports = Grenade;
