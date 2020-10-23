var _ = require('underscore');
var debug = require('debug')('Blaster:Saucer');
var util = require('util');

var Bomb = require('../shots/Bomb');
var Enemy = require('./Enemy');
var HitArbiter = require('../HitArbiter').HitArbiter;
var PathAction = require('../paths/PathAction').PathAction;
var PathTemplate = require('../paths/PathTemplate').PathTemplate;
var Point = require('../Point').Point;
var ScheduledAction = require('../paths/ScheduledAction').ScheduledAction;
var Scheduler = require('../timing/Scheduler').Scheduler;
var SplinePath = require('../paths/SplinePath').SplinePath;

function Saucer(audioPlayer, world, clock, startingPoint) {
    debug('Saucer constructor');
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

    this.health = 1;
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

util.inherits(Saucer, Enemy);

Saucer.prototype.getCollisionMask = function() {
    return [{
        left: -20,
        right: 20,
        top: -20,
        bottom: 20
    }];
};

Saucer.prototype.getDamageAgainst = function(actor) {
    return 5;
};

Saucer.prototype.getImageDetails = function() {
    return {
        name: 'saucer',
        numberOfFrames: 4,
        frameWidth: 80,
        currentFrame: this._currentFrame
    };
};

Saucer.prototype.hitBy = function(actor, damage) {
    this.health = Math.max(0, this.health - damage);
    return true;
};

Saucer.prototype.tick = function () {
    debug('Saucer.tick');
    Saucer.super_.prototype.tick.call(this);

    this._scheduler.executeDueOperations();

    this.move();

    // Check if this saucer has collided with any active enemies.
    var player = this._world.getPlayer();
    if (player) {
        this._hitArbiter.attemptToHit(player);
    }
};

Saucer.prototype.advanceCurrentFrame = function() {
    this._currentFrame = (this._currentFrame + 1) % 4;

    this._scheduler.scheduleOperation('advanceCurrentFrame', 200, _.bind(this.advanceCurrentFrame, this));
};

Saucer.prototype.dropBomb = function() {
    var bomb = new Bomb(this._audioPlayer, this._world, this._location);
    this._world.addActor(bomb);
};

Saucer.prototype.move = function() {
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

Saucer.prototype.calculatePaths = function() {
    var proto = Object.getPrototypeOf(this);
    if (!proto._pathsCalculated) {
        var introPath = new SplinePath(new PathTemplate(
            [
                new Point(0.0, 0.0),
                new Point(30.0, 100.0),
                new Point(100.0, 150.0),
                new Point(20.0, 200.0),
                new Point(-20.0, 250.0),
                new Point(-40.0, 300.0),
                new Point(-40.0, 350.0),
                new Point(-60.0, 400.0),
                new Point(-30.0, 350.0),
                new Point(-50.0, 300.0),
                new Point(-80.0, 250.0),
                new Point(-100.0, 200.0)
            ],
            [
                new ScheduledAction(0.65, PathAction.Fire), // The bottom of the incoming dive.
                new ScheduledAction(0.70, PathAction.Fire)
            ]
        ));
        proto._introPathTemplate = introPath.getPath(100);

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
                new Point(0.0, 0.0),
                new Point(30.0, 20.0),
                new Point(100.0, 30.0),
                new Point(180.0, -20.0),
                new Point(210.0, 0.0)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ));
        proto._flyRightPathTemplate = flyRightPath.getPath(50);

        var flyLeftPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-30, -10),
                new Point(-100, -45),
                new Point(-180, 30),
                new Point(-210, 0)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ));
        proto._flyLeftPathTemplate = flyLeftPath.getPath(50);

        var flyUpPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-10, -10),
                new Point(-40, -30),
                new Point(10, -80),
                new Point(30, -130),
                new Point(10, -160),
                new Point(0, -180)
            ],
            [
                new ScheduledAction(0.00, PathAction.Fire),
                new ScheduledAction(0.50, PathAction.Fire)
            ]
        ));
        proto._flyUpPathTemplate = flyUpPath.getPath(50);

        var flyDownPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(10, 10),
                new Point(50, 30),
                new Point(40, 80),
                new Point(0, 130),
                new Point(-20, 160),
                new Point(0, 180)
            ],
            [
                new ScheduledAction(0.50, PathAction.Fire),
                new ScheduledAction(1.00, PathAction.Fire)
            ]
        ));
        proto._flyDownPathTemplate = flyDownPath.getPath(50);

        var diveRightPath = new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-40, 30),
                new Point(30, 120),
                new Point(120, 240),
                new Point(160, 240),
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
                new Point(-120, 240),
                new Point(-160, 240),
                new Point(-180, 120),
                new Point(-200, 30)
            ],
            [
                new ScheduledAction(0.20, PathAction.Fire),
                new ScheduledAction(0.40, PathAction.Fire),
                new ScheduledAction(0.65, PathAction.Fire) // The bottom of the incoming dive.
            ]
        ));
        proto._diveLeftPathTemplate = diveLeftPath.getPath(60);

        proto._pathsCalculated = true;
    }
};

Saucer.prototype.prepareNextPath = function(pathTemplate) {
    this._currentPathTemplate = pathTemplate;
    this._currentPath = SplinePath.translatePath(pathTemplate, this._location.x, this._location.y);
    this._pathPosition = 0;
};

module.exports = Saucer;
