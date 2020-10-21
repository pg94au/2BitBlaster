var _ = require('underscore');
var debug = require('debug')('Blaster:SplitterFragment');
var util = require('util');

var Action = require('../Action');
var Enemy = require('./Enemy');
var HitArbiter = require('../HitArbiter');
var Scheduler = require('../timing/Scheduler').Scheduler;
var Shrapnel = require('../shots/Shrapnel');
var SplinePath = require('../paths/SplinePath').SplinePath;

var Side = {
    Left: 1,
    Right: 2
};

function SplitterFragment(audioPlayer, world, clock, side, startX, startY) {
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
    if (startX === undefined) {
        throw new Error('startX cannot be undefined');
    }
    if (startY === undefined) {
        throw new Error('startY cannot be undefined');
    }

    Enemy.apply(this, [audioPlayer, world, startX, startY]);

    this._side = side;
    this.health = 1;
    this._frameIndices = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
    this._currentFrame = 0;
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
        return 10;
    };

    this.calculatePaths();

    var proto = Object.getPrototypeOf(this);
    this.prepareNextPath(proto._separatePath[side]);
}

util.inherits(SplitterFragment, Enemy);

SplitterFragment.Side = Side;

SplitterFragment.prototype.getCollisionMask = function() {
    return [{
        left: -25,
        right: 25,
        top: -15,
        bottom: 15
    }];
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

        return {
            name: imageName,
            numberOfFrames: 10,
            frameWidth: 60,
            currentFrame: currentFrame
        };
    }
    else {
        return {
            name: 'splitter_fragment',
            numberOfFrames: 6,
            frameWidth: 60,
            currentFrame: this._frameIndices[this._currentFrame]
        };
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
    var shrapnel = new Shrapnel(this._audioPlayer, this._world, this._x, this._y, 270);
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
                if (this._x < this._world.getDimensions().width / 2) {
                    nextPath = proto._flyRightPathTemplate;
                }
                else {
                    nextPath = proto._flyLeftPathTemplate;
                }
            }
            else {
                if (this._y < this._world.getDimensions().height / 2) {
                    if (_.random(0, 1) > 0.5) {
                        nextPath = proto._flyDownPathTemplate;
                    }
                    else {
                        if (this._x < this._world.getDimensions().width / 2) {
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

SplitterFragment.prototype.calculatePaths = function() {
    var proto = Object.getPrototypeOf(this);
    if (!proto._pathsCalculated) {
        var floatAroundPath1 = new SplinePath({
            points: [
                [0.0, 0.0],
                [20.0, 30.0],
                [0.0, 50.0],
                [-30.0, 20.0],
                [0.0, 0.0]
            ]
        });
        proto._floatAroundPath1Template = floatAroundPath1.getPath(25);

        var floatAroundPath2 = new SplinePath({
            points: [
                [0.0, 0.0],
                [-25.0, 35.0],
                [0.0, 40.0],
                [35.0, 25.0],
                [0.0, 0.0]
            ]
        });
        proto._floatAroundPath2Template = floatAroundPath2.getPath(25);

        var flyRightPath = new SplinePath({
            points: [
                [0.0, 0.0],
                [20.0, -20.0],
                [60.0, 10.0],
                [100.0, 30.0],
                [140.0, 0.0]
            ],
            actions: [
                [0.50, Action.Fire]
            ]
        });
        proto._flyRightPathTemplate = flyRightPath.getPath(30);

        var flyLeftPath = new SplinePath({
            points: [
                [0, 0],
                [-20, -20],
                [-60, -40],
                [-100, 25],
                [-140, 0]
            ],
            actions: [
                [0.50, Action.Fire]
            ]
        });
        proto._flyLeftPathTemplate = flyLeftPath.getPath(30);

        var flyUpPath = new SplinePath({
            points: [
                [0, 0],
                [-15, -10],
                [-35, -25],
                [20, -40],
                [40, -60],
                [10, -80],
                [0, -100]
            ],
            actions: [
                [0.00, Action.Fire],
                [0.50, Action.Fire]
            ]
        });
        proto._flyUpPathTemplate = flyUpPath.getPath(30);

        var flyDownPath = new SplinePath({
            points: [
                [0, 0],
                [15, 10],
                [-20, 25],
                [-60, 40],
                [-10, 60],
                [30, 80],
                [0, 100]
            ],
            actions: [
                [0.50, Action.Fire],
                [1.00, Action.Fire]
            ]
        });
        proto._flyDownPathTemplate = flyDownPath.getPath(30);

        var diveRightPath = new SplinePath({
            points: [
                [0, 0],
                [-40, 50],
                [-80, 120],
                [0, 240],
                [100, 240],
                [150, 120],
                [200, 20]
            ],
            actions: [
                [0.20, Action.Fire],
                [0.40, Action.Fire],
                [0.65, Action.Fire] // The bottom of the incoming dive.
            ]
        });
        proto._diveRightPathTemplate = diveRightPath.getPath(60);

        var diveLeftPath = new SplinePath({
            points: [
                [0, 0],
                [40, 30],
                [60, 100],
                [-20, 240],
                [-120, 240],
                [-180, 120],
                [-200, 20]
            ],
            actions: [
                [0.20, Action.Fire],
                [0.40, Action.Fire],
                [0.65, Action.Fire] // The bottom of the incoming dive.
            ]
        });
        proto._diveLeftPathTemplate = diveLeftPath.getPath(60);

        var separateLeftPath = new SplinePath({
            points: [
                [0,0],
                [-60, -0],
                [-60, -60]
            ]
        }).getPath(20);
        var separateRightPath = SplinePath.mirrorPath(separateLeftPath);
        proto._separatePath = [];
        proto._separatePath[Side.Left] = separateLeftPath;
        proto._separatePath[Side.Right] = separateRightPath;

        proto._pathsCalculated = true;
    }
};

SplitterFragment.prototype.prepareNextPath = function(pathTemplate) {
    this._currentPathTemplate = pathTemplate;
    this._currentPath = SplinePath.translatePath(pathTemplate, this._x, this._y);
    this._pathPosition = 0;
};

module.exports = SplitterFragment;
