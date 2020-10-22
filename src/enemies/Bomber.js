var _ = require('underscore');
var debug = require('debug')('Blaster:Bomber');
var util = require('util');

var Action = require('../Action');
var Enemy = require('./Enemy');
var Grenade = require('../shots/Grenade');
var HitArbiter = require('../HitArbiter').HitArbiter;
var Scheduler = require('../timing/Scheduler').Scheduler;

function Bomber(audioPlayer, world, clock, startY) {
    debug('Bomber constructor');
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }
    if (startY === undefined) {
        throw new Error('startY cannot be undefined');
    }

    Enemy.apply(this, [audioPlayer, world, -40, startY]);

    this.health = 1;
    this._frameIndices = [0, 1, 2, 3, 4, 5, 5, 5, 4, 3, 2, 1];
    this._currentFrame = 0;
    this._grenadeDropPosition = _.random(75, this._world.getDimensions().width - 75);
    this._scheduler = new Scheduler(clock);
    this._hitArbiter = new HitArbiter(this);

    this.advanceCurrentFrame();

    this.getExplosionProperties = function() {
        var explosionProperties = {
            imageName: 'saucer_explosion',
            numberOfFrames: 4,
            frameWidth: 80,
            frameSpeed: 0.8,
            soundName: 'saucer_explosion'
        };
        return explosionProperties;
    };

    this.getScoreTotal = function() {
        return 50;
    };
}

util.inherits(Bomber, Enemy);

Bomber.prototype.getCollisionMask = function() {
    return [{
        left: -35,
        right: 45,
        top: -19,
        bottom: 19
    }];
};

Bomber.prototype.getDamageAgainst = function(actor) {
    return 5;
};

Bomber.prototype.getImageDetails = function() {
    return {
        name: 'bomber',
        numberOfFrames: 6,
        frameWidth: 80,
        currentFrame: this._frameIndices[this._currentFrame]
    };
};

Bomber.prototype.hitBy = function(actor, damage) {
    this.health = Math.max(0, this.health - damage);
    return true;
};

Bomber.prototype.tick = function () {
    debug('Bomber.tick');
    Bomber.super_.prototype.tick.call(this);

    this._scheduler.executeDueOperations();

    for (var i = 0; i < 3; i++) {
        this.move();

        if (this._x === this._grenadeDropPosition) {
            this.dropGrenade();
        }
    }
};

Bomber.prototype.advanceCurrentFrame = function() {
    this._currentFrame = (this._currentFrame + 1) % this._frameIndices.length;

    this._scheduler.scheduleOperation('advanceCurrentFrame', 100, _.bind(this.advanceCurrentFrame, this));
};

Bomber.prototype.dropGrenade = function() {
    var grenade = new Grenade(this._audioPlayer, this._world, this._x + 10, this._y + 30);
    this._world.addActor(grenade);
};

Bomber.prototype.move = function() {
    // Move across the screen toward the right side.
    this._x++;

    if (this._x > this._world.getDimensions().width + 40) {
        this._active = false;
    }
};

module.exports = Bomber;
