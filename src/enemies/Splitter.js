var _ = require('underscore');
var debug = require('debug')('Blaster:Splitter');
var util = require('util');

var Bounds = require('../Bounds').Bounds;
var Enemy = require('./Enemy');
var HitArbiter = require('../HitArbiter').HitArbiter;
var PathAction = require('../paths/PathAction').PathAction;
var PathTemplate = require('../paths/PathTemplate').PathTemplate;
var Point = require('../Point').Point;
var ScheduledAction = require('../paths/ScheduledAction').ScheduledAction;
var Scheduler = require('../timing/Scheduler').Scheduler;
var Shrapnel = require('../shots/Shrapnel');
var SplinePath = require('../paths/SplinePath').SplinePath;
var SplitterFragment = require('./SplitterFragment');

function Splitter(audioPlayer, world, clock, startingPoint) {
    debug('Splitter constructor');
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }

    Enemy.apply(this, [audioPlayer, world, startingPoint]);

    this._clock = clock;
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
    this.prepareNextPath(proto._introPathTemplate);
}

util.inherits(Splitter, Enemy);

Splitter.prototype.getCollisionMask = function() {
    return [new Bounds(-40, 40, -20, 20)];
};

Splitter.prototype.getDamageAgainst = function(actor) {
    return 5;
};

Splitter.prototype.getImageDetails = function() {
    return {
        name: 'splitter',
        numberOfFrames: 6,
        frameWidth: 100,
        currentFrame: this._frameIndices[this._currentFrame]
    };
};

Splitter.prototype.hitBy = function(actor, damage) {
    this.health = Math.max(0, this.health - damage);
    return true;
};

Splitter.prototype.tick = function () {
    debug('Splitter.tick');
    Splitter.super_.prototype.tick.call(this);

    this._scheduler.executeDueOperations();

    this.move();

    // Check if this Splitter has collided with any active enemies.
    var player = this._world.getPlayer();
    if (player) {
        this._hitArbiter.attemptToHit(player);
    }

    if (this.health <= 0) {
        var leftSplitterFragment = new SplitterFragment(this._audioPlayer, this._world, this._clock, SplitterFragment.Side.Left, this._location.left(40));
        this._world.addActor(leftSplitterFragment);

        var rightSplitterFragment = new SplitterFragment(this._audioPlayer, this._world, this._clock, SplitterFragment.Side.Right, this._location.right(40));
        this._world.addActor(rightSplitterFragment);
    }
};

Splitter.prototype.advanceCurrentFrame = function() {
    this._currentFrame = (this._currentFrame + 1) % this._frameIndices.length;

    this._scheduler.scheduleOperation('advanceCurrentFrame', 100, _.bind(this.advanceCurrentFrame, this));
};

Splitter.prototype.scheduleNextBombDrop = function() {
    // Need to bind so that 'this' in dropBomb will refer to the Splitter.
    this._scheduler.scheduleOperation('dropBombAt', 3000, _.bind(this.dropBomb, this));
};

Splitter.prototype.dropBomb = function() {
    var leftShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 267);
    this._world.addActor(leftShrapnel);

    var rightShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 273);
    this._world.addActor(rightShrapnel);
};

Splitter.prototype.move = function() {
    // Choose the next path to follow once we've reach the end of the current path.
    if (this._pathPosition >= this._currentPath.length) {
        var proto = Object.getPrototypeOf(this);

        var nextPath;
        if (this._currentPathTemplate === proto._floatAroundPathTemplate) {
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
            nextPath = proto._floatAroundPathTemplate;
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

Splitter.prototype.calculatePaths = function() {
    var proto = Object.getPrototypeOf(this);
    if (!proto._pathsCalculated) {
        var introPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(100, 50),
                new Point(200, 100),
                new Point(50, 150),
                new Point(-150, 200),
                new Point(-200, 250),
                new Point(-50, 300),
                new Point(50, 350),
                new Point(150, 400),
                new Point(100, 350),
                new Point(0, 200),
                new Point(-100, 150),
                new Point(-60, 175),
                new Point(-30, 150),
                new Point(0, 150)
            ],
            [
                new ScheduledAction(0.25, PathAction.Fire),
                new ScheduledAction(0.50, PathAction.Fire),
                new ScheduledAction(0.70, PathAction.Fire)
            ]
        ));
        proto._introPathTemplate = introPath.getPath(150);

        var floatAroundPath = new SplinePath(new PathTemplate(
            [
                new Point(0.0, 0.0),
                new Point(40.0, 40.0),
                new Point(0.0, 80.0),
                new Point(-40.0, 40.0),
                new Point(0.0, 0.0)
            ],
            []
        ));
        proto._floatAroundPathTemplate = floatAroundPath.getPath(50);

        var flyRightPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(75, 50),
                new Point(150, -75),
                new Point(200, 50),
                new Point(250, 0)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ));
        proto._flyRightPathTemplate = flyRightPath.getPath(50);

        var flyLeftPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-75, -50),
                new Point(-150, 75),
                new Point(-200, -50),
                new Point(-250, 0)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ));
        proto._flyLeftPathTemplate = flyLeftPath.getPath(50);

        var flyUpPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-50, -50),
                new Point(50, -100),
                new Point(0, -150)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ));
        proto._flyUpPathTemplate = flyUpPath.getPath(50);

        var flyDownPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-50, 50),
                new Point(50, 100),
                new Point(0, 150)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ));
        proto._flyDownPathTemplate = flyDownPath.getPath(50);

        var diveRightPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-40, 30),
                new Point(30, 120),
                new Point(120, 200),
                new Point(160, 200),
                new Point(180, 120),
                new Point(200, 30)
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
                new Point(-30, 120),
                new Point(-120, 200),
                new Point(-160, 200),
                new Point(-180, 120),
                new Point(-200, 30)
            ],
            [
                new ScheduledAction(0.20, PathAction.Fire),
                new ScheduledAction(0.40, PathAction.Fire),
                new ScheduledAction(0.65, PathAction.Fire) // The bottom of the incoming dive.
            ]
        ))
        proto._diveLeftPathTemplate = diveLeftPath.getPath(60);

        proto._pathsCalculated = true;
    }
};

Splitter.prototype.prepareNextPath = function(pathTemplate) {
    this._currentPathTemplate = pathTemplate;
    this._currentPath = SplinePath.translatePath(pathTemplate, this._location.x, this._location.y);
    this._pathPosition = 0;
};

module.exports = Splitter;
