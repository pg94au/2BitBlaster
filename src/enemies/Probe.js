var _ = require('underscore');
var debug = require('debug')('Blaster:Probe');
var util = require('util');

var Action = require('../Action');
var Bomb = require('../shots/Bomb');
var Enemy = require('./Enemy');
var Explosion = require('../Explosion');
var HitArbiter = require('../HitArbiter');
var Scheduler = require('../timing/Scheduler').Scheduler;
var SplinePath = require('../paths/SplinePath').SplinePath;

function Probe(audioPlayer, world, clock, startX, startY) {
    debug('Probe constructor');
    Enemy.apply(this, [audioPlayer, world, startX, startY]);
    this.health = 3;
    this._currentFrame = 0;
    this._scheduler = new Scheduler(clock);
    this._hitArbiter = new HitArbiter(this);

    this.advanceCurrentFrame();

    this.calculatePaths();
    var proto = Object.getPrototypeOf(this);
    this.prepareNextPath(proto._introPathTemplate);

    this.getExplosionProperties = function() {
        var explosionProperties = {
            imageName: 'probe_explosion',
            numberOfFrames: 4,
            frameWidth: 75,
            frameSpeed: 0.8,
            soundName: 'probe_explosion'
        };
        return explosionProperties;
    };

    this.getScoreTotal = function() {
        return 25;
    };
}

util.inherits(Probe, Enemy);

Probe.prototype.getCollisionMask = function() {
    return [{
        left: -20,
        right: 20,
        top: -20,
        bottom: 20
    }];
};

Probe.prototype.getDamageAgainst = function(actor) {
    return 5;
};

Probe.prototype.getImageDetails = function() {
    return {
        name: 'probe',
        numberOfFrames: 3,
        frameWidth: 70,
        currentFrame: Math.min(3 - this.health, 2)
    };
};

Probe.prototype.hitBy = function(actor, damage) {
    this.health = Math.max(0, this.health - damage);

    return true;
};

Probe.prototype.tick = function () {
    debug('Probe.tick');
    Probe.super_.prototype.tick.call(this);

    this._scheduler.executeDueOperations();

    this.move();

    // Check if this probe has collided with any active enemies.
    var player = this._world.getPlayer();
    if (player) {
        this._hitArbiter.attemptToHit(player);
    }
};

Probe.prototype.dropBomb = function() {
    var bomb = new Bomb(this._audioPlayer, this._world, this._x, this._y);
    this._world.addActor(bomb);
};

Probe.prototype.advanceCurrentFrame = function() {
    this._currentFrame = (this._currentFrame + 1) % 2;

    this._scheduler.scheduleOperation('advanceCurrentFrame', 1000, _.bind(this.advanceCurrentFrame, this));
};

Probe.prototype.move = function() {
    // Choose the next path to follow once we've reach the end of the current path.
    if (this._pathPosition >= this._currentPath.length) {
        var proto = Object.getPrototypeOf(this);

        var nextPath;
        if (this._x < 120) {
            nextPath = proto._diveRightPathTemplate;
        }
        else if (this._x > this._world.getDimensions().width - 120) {
            nextPath = proto._diveLeftPathTemplate;
        }
        else if (_.random(0, 1) > 0.5) {
            nextPath = proto._diveRightPathTemplate;
        }
        else {
            nextPath = proto._diveLeftPathTemplate;
        }

        this.prepareNextPath(nextPath);
    }

    // Follow the current path.
    switch(this._currentPath[this._pathPosition].action) {
        case Action.Move:
            var point = this._currentPath[this._pathPosition].location;
            this._x = point[0];
            this._y = point[1];
            break;
        case Action.Fire:
            this.dropBomb();
            break;
    }
    this._pathPosition++;
};

Probe.prototype.calculatePaths = function() {
    var proto = Object.getPrototypeOf(this);
    if (!proto._pathsCalculated) {
        var introPath = new SplinePath({
            points: [
                [0.0, 0.0],
                [50.0, 100.0],
                [100.0, 200.0],
                [150.0, 300.0],
                [100.0, 400.0],
                [-25.0, 450.0],
                [-125.0, 400.0],
                [-175.0, 300.0],
                [-125.0, 200.0],
                [-75.0, 100.0],
                [-25.0, 50.0],
                [0.0, 50.0]
            ],
            actions: [
                [0.50, Action.Fire]
            ]
        });
        proto._introPathTemplate = introPath.getPath(100);

        var diveRightPath = new SplinePath({
            points: [
                [0.0, 0.0],
                [-40.0, 50.0],
                [-10.0, 200.0],
                [30.0, 300.0],
                [50.0, 400.0],
                [80.0, 300.0],
                [40.0, 200.0],
                [80.0, 50.0],
                [100.0, 0.0]
            ],
            actions: [
                [0.01, Action.Fire]
            ]
        });
        proto._diveRightPathTemplate = diveRightPath.getPath(100);

        var diveLeftPath = new SplinePath({
            points: [
                [0.0, 0.0],
                [40.0, 50.0],
                [10.0, 200.0],
                [-30.0, 300.0],
                [-50.0, 400.0],
                [-80.0, 300.0],
                [-40.0, 200.0],
                [-80.0, 50.0],
                [-100.0, 0.0]
            ],
            actions: [
                [0.01, Action.Fire]
            ]
        });
        proto._diveLeftPathTemplate = diveLeftPath.getPath(100);
    }
};

Probe.prototype.prepareNextPath = function(pathTemplate) {
    this._currentPathTemplate = pathTemplate;
    this._currentPath = SplinePath.translatePath(pathTemplate, this._x, this._y);
    this._pathPosition = 0;
};

module.exports = Probe;
