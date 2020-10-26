var _ = require('underscore');
var debug = require('debug')('Blaster:Spinner');
var util = require('util');

var Bomb = require('../shots/Bomb');
var Bounds = require('../Bounds').Bounds;
var Enemy = require('./Enemy');
var ExplosionProperties = require('../ExplosionProperties').ExplosionProperties;
var HitArbiter = require('../HitArbiter').HitArbiter;
var ImageDetails = require('../ImageDetails').ImageDetails;
var PathAction = require('../paths/PathAction').PathAction;
var PathTemplate = require('../paths/PathTemplate').PathTemplate;
var Point = require('../Point').Point;
var Scheduler = require('../timing/Scheduler').Scheduler;
var SplinePath = require('../paths/SplinePath').SplinePath;

var Bias = {
    Left: 1,
    Right: 2
};

function Spinner(audioPlayer, world, clock, startingPoint, path, bias) {
    debug('Spinner constructor');
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }
    if (path === undefined) {
        throw new Error('path cannot be undefined');
    }
    if (path < 1 || path > 2) {
        throw new Error('path value out of range');
    }
    if (bias === undefined) {
        throw new Error('bias cannot be undefined');
    }

    Enemy.apply(this, [audioPlayer, world, startingPoint]);

    this.health = 1;
    this._currentFrame = 0;
    this._scheduler = new Scheduler(clock);
    this._hitArbiter = new HitArbiter(this);

    this.advanceCurrentFrame();

    this.getExplosionProperties = function() {
        return new ExplosionProperties('saucer_explosion', 4, 80, 0.8, 'saucer_explosion');
    };

    this.getScoreTotal = function() {
        return 5;
    };

    this.calculatePaths();

    var proto = Object.getPrototypeOf(this);

    switch(bias) {
        case Bias.Left:
            this.prepareNextPath(proto._leftPathTemplates[path - 1]);
            break;
        case Bias.Right:
            this.prepareNextPath(proto._rightPathTemplates[path - 1]);
            break;
        default:
            throw new Error('Unrecognized bias argument: ' + bias);
            break;
    }
}

Spinner.Bias = Bias;

util.inherits(Spinner, Enemy);

Spinner.prototype.getCollisionMask = function() {
    return [new Bounds(-30, 30, -30, 30)];
};

Spinner.prototype.getDamageAgainst = function(actor) {
    return 5;
};

Spinner.prototype.getImageDetails = function() {
    return new ImageDetails('spinner', 12, 80, this._currentFrame);
};

Spinner.prototype.hitBy = function(actor, damage) {
    this.health = Math.max(0, this.health - damage);
    return true;
};

Spinner.prototype.tick = function () {
    debug('Spinner.tick');
    Spinner.super_.prototype.tick.call(this);

    this._scheduler.executeDueOperations();

    this.move();

    this.scheduleNextBombDrop();

    // Check if this spinner has collided with any active enemies.
    var player = this._world.getPlayer();
    if (player) {
        this._hitArbiter.attemptToHit(player);
    }
};

Spinner.prototype.advanceCurrentFrame = function() {
    this._currentFrame = (this._currentFrame + 1) % 12;

    this._scheduler.scheduleOperation('advanceCurrentFrame', 60, _.bind(this.advanceCurrentFrame, this));
};

Spinner.prototype.scheduleNextBombDrop = function() {
    // Need to bind so that 'this' in dropBomb will refer to the Spinner.
    this._scheduler.scheduleOperation('dropBombAt', _.random(2000, 4000), _.bind(this.dropBomb, this));
};

Spinner.prototype.dropBomb = function() {
    var worldCoordinates = this._world.getDimensions();

    if (this._location.x > 0 && this._location.x < worldCoordinates.width
        && this._location.y > 0 && this._location.y < worldCoordinates.height) {
        // Don't drop a bomb if we're too low.  Not very fair.
        if (this._location.y < (worldCoordinates.height / 2)) {
            var bomb = new Bomb(this._audioPlayer, this._world, this._location);
            this._world.addActor(bomb);
        }
    }
};

Spinner.prototype.move = function() {
    var self = this;

    // Choose the next path to follow once we've reach the end of the current path.
    if (this._pathPosition >= this._currentPath.length) {
        this._scheduler.scheduleOperation('resetPosition', 2000, function() {
            self._pathPosition = 0;
        });
        return;
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

Spinner.prototype.calculatePaths  = function() {
    var proto = Object.getPrototypeOf(this);

    proto._rightPathTemplates = [
        new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-25, 100),
                new Point(0, 200), // Start of first loop
                new Point(100, 300),
                new Point(200, 200),
                new Point(100, 100),
                new Point(0, 200),
                new Point(0, 300), // Start of second loop
                new Point(100, 400),
                new Point(200, 300),
                new Point(100, 200),
                new Point(0, 300),
                new Point(0, 400), // Drop out of sight
                new Point(-100, 450),
                new Point(-150, 500),
                new Point(-225, 550),
                new Point(-225, 700),

                new Point(-350, 800),
                new Point(-350, 750),
                new Point(-350, 700),
                new Point(-350, 500),
                new Point(-200, 450),
                new Point(-150, 350),
                new Point(-150, 300),
                new Point(-50, 200),
                new Point(50, 300),
                new Point(-50, 400),
                new Point(-150, 300),
                new Point(-250, 250),
                new Point(-250, 150),
                new Point(-200, 50),
                new Point(-100, 0),
                new Point(-100, -50),
                new Point(-100, -100)
            ],
            []
        )).getPath(350),

        new SplinePath(new PathTemplate(
            [
                new Point(0, 0),
                new Point(-50, 50),
                new Point(-100, 100),
                new Point(-150, 150),
                new Point(-200, 200),
                new Point(-250, 250),
                new Point(-300, 300),
                new Point(-250, 350),
                new Point(-200, 300),
                new Point(-150, 250),
                new Point(-100, 200),
                new Point(-50, 150),
                new Point(0, 100),
                new Point(50, 150),
                new Point(100, 250),
                new Point(100, 300),
                new Point(50, 400),
                new Point(-50, 450),
                new Point(-150, 350),
                new Point(-250, 300),
                new Point(-350, 200),
                new Point(-400, 100)
            ],
            []
        )).getPath(120)
    ];

    // Build mirror image path for left swoop.
    proto._leftPathTemplates = [
        SplinePath.mirrorPath(proto._rightPathTemplates[0]),
        SplinePath.mirrorPath(proto._rightPathTemplates[1])
    ];

    proto._pathsCalculated = true;
};

Spinner.prototype.prepareNextPath = function(pathTemplate) {
    this._currentPathTemplate = pathTemplate;
    this._currentPath = SplinePath.translatePath(pathTemplate, this._location.x, this._location.y);
    this._pathPosition = 0;
};

module.exports = Spinner;
