var _ = require('underscore');
var debug = require('debug')('Blaster:Probe');
var util = require('util');

var Bomb = require('../shots/Bomb');
var Bounds = require('../Bounds').Bounds;
var Enemy = require('./Enemy');
var Explosion = require('../Explosion');
var HitArbiter = require('../HitArbiter').HitArbiter;
var PathAction = require('../paths/PathAction').PathAction;
var PathTemplate = require('../paths/PathTemplate').PathTemplate;
var Point = require('../Point').Point;
var ScheduledAction = require('../paths/ScheduledAction').ScheduledAction;
var Scheduler = require('../timing/Scheduler').Scheduler;
var SplinePath = require('../paths/SplinePath').SplinePath;

function Probe(audioPlayer, world, clock, startingPoint) {
    debug('Probe constructor');
    Enemy.apply(this, [audioPlayer, world, startingPoint]);
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
    return [new Bounds(-20, 20, -20, 20)];
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
    var bomb = new Bomb(this._audioPlayer, this._world, this._location);
    this._world.addActor(bomb);
};

Probe.prototype.advanceCurrentFrame = function() {
    this._currentFrame = (this._currentFrame + 1) % 2;

    this._scheduler.scheduleOperation('advanceCurrentFrame', 1000, _.bind(this.advanceCurrentFrame, this));
};

Probe.prototype.move = function() {
    // Choose the next path to follow if we've reached the end of the current path.
    if (this._pathPosition >= this._currentPath.length) {
        var proto = Object.getPrototypeOf(this);

        var nextPath;
        if (this._location.x < 120) {
            nextPath = proto._diveRightPathTemplate;
        }
        else if (this._location.x > this._world.getDimensions().width - 120) {
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
        case PathAction.Move:
            this._location = this._currentPath[this._pathPosition].location;
            break;
        case PathAction.Fire:
            this.dropBomb();
            break;
    }
    this._pathPosition++;
};

Probe.prototype.calculatePaths = function() {
    var proto = Object.getPrototypeOf(this);
    if (!proto._pathsCalculated) {
        var introPath = new SplinePath(new PathTemplate(
            [
                new Point(0.0, 0.0),
                new Point(50.0, 100.0),
                new Point(100.0, 200.0),
                new Point(150.0, 300.0),
                new Point(100.0, 400.0),
                new Point(-25.0, 450.0),
                new Point(-125.0, 400.0),
                new Point(-175.0, 300.0),
                new Point(-125.0, 200.0),
                new Point(-75.0, 100.0),
                new Point(-25.0, 50.0),
                new Point(0.0, 50.0)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ));
        proto._introPathTemplate = introPath.getPath(100);

        var diveRightPath = new SplinePath(new PathTemplate(
            [
                new Point(0.0, 0.0),
                new Point(-40.0, 50.0),
                new Point(-10.0, 200.0),
                new Point(30.0, 300.0),
                new Point(50.0, 400.0),
                new Point(80.0, 300.0),
                new Point(40.0, 200.0),
                new Point(80.0, 50.0),
                new Point(100.0, 0.0)
            ],
            [
                new ScheduledAction(0.01, PathAction.Fire)
            ]
        ));
        proto._diveRightPathTemplate = diveRightPath.getPath(100);

        var diveLeftPath = new SplinePath(new PathTemplate(
            [
                new Point(0.0, 0.0),
                new Point(40.0, 50.0),
                new Point(10.0, 200.0),
                new Point(-30.0, 300.0),
                new Point(-50.0, 400.0),
                new Point(-80.0, 300.0),
                new Point(-40.0, 200.0),
                new Point(-80.0, 50.0),
                new Point(-100.0, 0.0)
            ],
            [
                new ScheduledAction(0.01, PathAction.Fire)
            ]
        ))
        proto._diveLeftPathTemplate = diveLeftPath.getPath(100);
    }
};

Probe.prototype.prepareNextPath = function(pathTemplate) {
    this._currentPathTemplate = pathTemplate;
    this._currentPath = SplinePath.translatePath(pathTemplate, this._location.x, this._location.y);
    this._pathPosition = 0;
};

module.exports = Probe;
