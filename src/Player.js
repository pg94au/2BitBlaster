var debug = require('debug')('Blaster:Player');
var events = require('events');
var util = require('util');

var Actor = require('./Actor');
var Bullet = require('./shots/Bullet');
var Explosion = require('./Explosion');
var HitArbiter = require('./HitArbiter').HitArbiter;
var Point = require('./Point').Point;
var Scheduler = require('./timing/Scheduler').Scheduler;

function Player(joystick, audioPlayer, world, startingPoint, bounds, clock) {
    debug('Player constructor');
    if (joystick === undefined) {
        throw new Error('joystick cannot be undefined');
    }
    if (audioPlayer === undefined) {
        throw new Error('audioPlayer cannot be undefined');
    }
    if (world === undefined) {
        throw new Error('world cannot be undefined');
    }
    if (bounds === undefined) {
        throw new Error('bounds cannot be undefined');
    }
    if (clock === undefined) {
        throw new Error('clock cannot be undefined');
    }
    this._joystick = joystick;
    this._audioPlayer = audioPlayer;
    this._bounds = bounds;
    this._hitArbiter = new HitArbiter(this);
    this._scheduler = new Scheduler(clock);

    this._eventEmitter = new events.EventEmitter();
    this._currentHealth = 5;
    this._canFireBullet = true;
    this._displayingInjury = false;
    this._vulnerable = false;
    this._invulnerableFrames = [1, 2, 3, 3, 2, 1];
    this._currentInvulnerableFrameIndex = 2;

    var self = this;
    this._scheduler.scheduleOperation('becomeVulnerable', 3000, function() {
        debug('Player becoming vulnerable');
        self._vulnerable = true;
    });

    Actor.apply(this, [world, startingPoint]);
}

util.inherits(Player, Actor);

Player.prototype.getCollisionMask = function() {
    if (this._vulnerable) {
        return [{
            left: -20,
            right: 20,
            top: -20,
            bottom: 20
        }];
    }
    else {
        return [{
            left: -25,
            right: 25,
            top: -35,
            bottom: 35
        }];
    }
};

Player.prototype.getDamageAgainst = function(actor) {
    return 5;
};

Player.prototype.getImageDetails = function() {
    if (this._vulnerable) {
        return {
            name: 'player',
            numberOfFrames: 4,
            frameWidth: 50,
            currentFrame: this._displayingInjury ? 1 : 0
        };
    }
    else {
        if (this._currentInvulnerableFrameIndex < this._invulnerableFrames.length - 1) {
            this._currentInvulnerableFrameIndex++;
        }
        else {
            this._currentInvulnerableFrameIndex = 2;
        }
        var currentFrame = this._invulnerableFrames[this._currentInvulnerableFrameIndex];

        return {
            name: 'player',
            numberOfFrames: 4,
            frameWidth: 50,
            currentFrame: currentFrame
        };
    }
};

Player.prototype.getZIndex = function() {
    return 10;
};

Player.prototype.hitBy = function(shot, damage) {
    var self = this;

    if (this._vulnerable) {
        this._currentHealth = Math.max(0, this._currentHealth - damage);
        this._eventEmitter.emit('health', this._currentHealth);
        this._displayingInjury = true;
        this._scheduler.scheduleOperation('displayInjury', 150, function() {
            self._displayingInjury = false;
        });
        this._audioPlayer.play('player_hit');
        return true;
    }
    else {
        return false;
    }
};

Player.prototype.on = function(e, f) {
    debug('Player.on');
    this._eventEmitter.on(e, f);
    this._eventEmitter.emit('health', this._currentHealth);
};

Player.prototype.tick = function () {
    var self = this;

    debug('Player.tick');
    Player.super_.prototype.tick.call(this);

    this._scheduler.executeDueOperations();

    if (this._currentHealth <= 0) {
        this._active = false;

        var explosionProperties = {
            imageName: 'player_explosion',
            numberOfFrames: 4,
            frameWidth: 80,
            frameSpeed: 0.8,
            soundName: 'player_explosion'
        };
        var playerExplosion = new Explosion(
            explosionProperties,
            this._audioPlayer,
            this._world,
            this.getCoordinates().x, this.getCoordinates().y
        );
        this._world.addActor(playerExplosion);

        return;
    }

    var direction = this._joystick.getCurrentDirection();

    for (var i = 0; i < 5; i++) {
        Player.super_.prototype.move.call(this, direction);
    }

    if (this._x < this._bounds.minX) {
        this._x = this._bounds.minX;
    }
    if (this._x > this._bounds.maxX) {
        this._x = this._bounds.maxX;
    }
    if (this._y < this._bounds.minY) {
        this._y = this._bounds.minY;
    }
    if (this._y > this._bounds.maxY) {
        this._y = this._bounds.maxY;
    }

    debug('Current position is (' + this._x + ', ' + this._y + ')');

    // Check if the player has collided with any active enemies.
    this._world.getActiveEnemies().forEach(function(enemy) {
        self._hitArbiter.attemptToHit(enemy);
    });

    // Add a new bullet to the world if joystick is fired and allowed.
    if (this._joystick.getFireState()) {
        if (this._canFireBullet) {
            this._canFireBullet = false;
            var bullet = new Bullet(this._audioPlayer, this._world, new Point(this._x, this._y));
            this._world.addActor(bullet);

            // Another bullet cannot be fired until a fixed time period.
            self._scheduler.scheduleOperation('canFireBullet', 1000, function() {
                debug('tick: Next bullet can now be fired.');
                self._canFireBullet = true;
            });
        }
    }
};

module.exports = Player;
