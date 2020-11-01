var _ = require('underscore');
var debug = require('debug')('Blaster:SplitterFragment');
var util = require('util');

var Bounds = require('../Bounds').Bounds;
var Enemy = require('./Enemy');
var ExplosionProperties = require('../ExplosionProperties').ExplosionProperties;
var HitArbiter = require('../HitArbiter').HitArbiter;
var ImageDetails = require('../ImageDetails').ImageDetails;
var PathAction = require('../paths/PathAction').PathAction;
var PathTemplate = require('../paths/PathTemplate').PathTemplate;
var Point = require('../Point').Point;
var ScheduledAction = require('../paths/ScheduledAction').ScheduledAction;
var Scheduler = require('../timing/Scheduler').Scheduler;
var Shrapnel = require('../shots/Shrapnel').Shrapnel;
var SplinePath = require('../paths/SplinePath').SplinePath;

var Side = {
    Left: 1,
    Right: 2
};

function SplitterFragment(audioPlayer, world, clock, side, startingPoint) {
    debug('SplitterFragment constructor');
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }
    if (side === undefined) {
        throw new Error('side cannot be undefined');
    }

    Enemy.apply(this, [audioPlayer, world, startingPoint]);

    this._side = side;
    this.health = 1;
    this._frameIndices = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
    this._currentFrame = 0;
    this._scheduler = new Scheduler(clock);
    this._hitArbiter = new HitArbiter(this);

    this.advanceCurrentFrame();

    this.getExplosionProperties = function() {
        return new ExplosionProperties('saucer_explosion', 4, 80, 0.8, 'saucer_explosion');
    };

    this.getScoreTotal = function() {
        return 10;
    };

    this.calculatePaths();

    var proto = Object.getPrototypeOf(this);
    this.prepareNextPath(proto._separatePath[side]);
}

util.inherits(SplitterFragment, Enemy);

SplitterFragment.Side = Side;

SplitterFragment.prototype.getCollisionMask = function() {
    return [new Bounds(-25, 25, -15, 15)];
};

SplitterFragment.prototype.getDamageAgainst = function(actor) {
    return 5;
};

SplitterFragment.prototype.getImageDetails = function() {
    var proto = Object.getPrototypeOf(this);
    if ((this._currentPathTemplate === proto._separatePath[Side.Left]) ||
        (this._currentPathTemplate === proto._separatePath[Side.Right])) {
        var currentFrame = Math.round(this._pathPosition / this._currentPath.length * 9);
        var imageName = (this._side === Side.Left) ? 'splitter_left_separation' : 'splitter_right_separation';

        return new ImageDetails(imageName, 10, 60, currentFrame);
    }
    else {
        return new ImageDetails('splitter_fragment', 6, 60, this._frameIndices[this._currentFrame]);
    }
};

SplitterFragment.prototype.hitBy = function(actor, damage) {
    this.health = Math.max(0, this.health - damage);
    return true;
};

SplitterFragment.prototype.tick = function () {
    debug('SplitterFragment.tick');
    SplitterFragment.super_.prototype.tick.call(this);

    this._scheduler.executeDueOperations();

    this.move();

    // Check if this Splitter fragment has collided with any active enemies.
    var player = this._world.getPlayer();
    if (player) {
        this._hitArbiter.attemptToHit(player);
    }
};

SplitterFragment.prototype.advanceCurrentFrame = function() {
    this._currentFrame = (this._currentFrame + 1) % this._frameIndices.length;

    this._scheduler.scheduleOperation('advanceCurrentFrame', 100, _.bind(this.advanceCurrentFrame, this));
};

SplitterFragment.prototype.scheduleNextBombDrop = function() {
    // Need to bind so that 'this' in dropBomb will refer to the Splitter fragment.
    this._scheduler.scheduleOperation('dropBombAt', 3000, _.bind(this.dropBomb, this));
};

SplitterFragment.prototype.dropBomb = function() {
    var shrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 270);
    this._world.addActor(shrapnel);
};

SplitterFragment.prototype.move = function() {
    // Choose the next path to follow once we've reach the end of the current path.
    if (this._pathPosition >= this._currentPath.length) {
        var proto = Object.getPrototypeOf(this);

        var nextPath;
        if ((this._currentPathTemplate === proto._floatAroundPath1Template)
            || (this._currentPathTemplate === proto._floatAroundPath2Template)) {
            if (_.random(0, 1) > 0.5) {
                if (this._location.x < this._world.getDimensions().width / 2) {
                    nextPath = proto._flyRightPathTemplate;
                }
                else {
                    nextPath = proto._flyLeftPathTemplate;
                }
            }
            else {
                if (this._location.y < this._world.getDimensions().height / 2) {
                    if (_.random(0, 1) > 0.5) {
                        nextPath = proto._flyDownPathTemplate;
                    }
                    else {
                        if (this._location.x < this._world.getDimensions().width / 2) {
                            nextPath = proto._diveRightPathTemplate;
                        }
                        else {
                            nextPath = proto._diveLeftPathTemplate;
                        }
                    }
                }
                else {
                    nextPath = proto._flyUpPathTemplate;
                }
            }
        }
        else {
            if (_.random(0, 1) > 0.5) {
                nextPath = proto._floatAroundPath1Template;
            }
            else {
                nextPath = proto._floatAroundPath2Template;
            }
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

SplitterFragment.prototype.calculatePaths = function() {
    var proto = Object.getPrototypeOf(this);
    if (!proto._pathsCalculated) {
        var floatAroundPath1 = new SplinePath(new PathTemplate(
            [
                new Point(0.0, 0.0),
                new Point(20.0, 30.0),
                new Point(0.0, 50.0),
                new Point(-30.0, 20.0),
                new Point(0.0, 0.0)
            ],
            []
        ));
        proto._floatAroundPath1Template = floatAroundPath1.getPath(25);

        var floatAroundPath2 = new SplinePath(new PathTemplate(
            [
                new Point(0.0, 0.0),
                new Point(-25.0, 35.0),
                new Point(0.0, 40.0),
                new Point(35.0, 25.0),
                new Point(0.0, 0.0)
            ],
            []
        ));
        proto._floatAroundPath2Template = floatAroundPath2.getPath(25);

        var flyRightPath = new SplinePath(new PathTemplate(
            [
                new Point(0.0, 0.0),
                new Point(20.0, -20.0),
                new Point(60.0, 10.0),
                new Point(100.0, 30.0),
                new Point(140.0, 0.0)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ));
        proto._flyRightPathTemplate = flyRightPath.getPath(30);

        var flyLeftPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-20, -20),
                new Point(-60, -40),
                new Point(-100, 25),
                new Point(-140, 0)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ))
        proto._flyLeftPathTemplate = flyLeftPath.getPath(30);

        var flyUpPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-15, -10),
                new Point(-35, -25),
                new Point(20, -40),
                new Point(40, -60),
                new Point(10, -80),
                new Point(0, -100)
            ],
            [
                new ScheduledAction(0.00, PathAction.Fire),
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ));
        proto._flyUpPathTemplate = flyUpPath.getPath(30);

        var flyDownPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(15, 10),
                new Point(-20, 25),
                new Point(-60, 40),
                new Point(-10, 60),
                new Point(30, 80),
                new Point(0, 100)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire),
                new ScheduledAction(1.00, PathAction.Fire)
            ]
        ));
        proto._flyDownPathTemplate = flyDownPath.getPath(30);

        var diveRightPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-40, 50),
                new Point(-80, 120),
                new Point(0, 240),
                new Point(100, 240),
                new Point(150, 120),
                new Point(200, 20)
            ],
            [
                new ScheduledAction(0.20, PathAction.Fire),
                new ScheduledAction(0.40, PathAction.Fire),
                new ScheduledAction(0.65, PathAction.Fire) // The bottom of the incoming dive.
            ]
        ));
        proto._diveRightPathTemplate = diveRightPath.getPath(60);

        var diveLeftPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(40, 30),
                new Point(60, 100),
                new Point(-20, 240),
                new Point(-120, 240),
                new Point(-180, 120),
                new Point(-200, 20)
            ],
            [
                new ScheduledAction(0.20, PathAction.Fire),
                new ScheduledAction(0.40, PathAction.Fire),
                new ScheduledAction(0.65, PathAction.Fire) // The bottom of the incoming dive.
            ]
        ));
        proto._diveLeftPathTemplate = diveLeftPath.getPath(60);

        var separateLeftPath = new SplinePath(new PathTemplate(
            [
                new Point(0,0),
                new Point(-60, -0),
                new Point(-60, -60)
            ],
            []
        )).getPath(20);
        var separateRightPath = SplinePath.mirrorPath(separateLeftPath);
        proto._separatePath = [];
        proto._separatePath[Side.Left] = separateLeftPath;
        proto._separatePath[Side.Right] = separateRightPath;

        proto._pathsCalculated = true;
    }
};

SplitterFragment.prototype.prepareNextPath = function(pathTemplate) {
    this._currentPathTemplate = pathTemplate;
    this._currentPath = SplinePath.translatePath(pathTemplate, this._location.x, this._location.y);
    this._pathPosition = 0;
};

module.exports = SplitterFragment;
