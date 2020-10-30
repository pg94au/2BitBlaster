var expect = require('chai').expect;

var Actor = require('../src/Actor');
var Clock = require('../src/timing/Clock').Clock;
var Enemy = require('../src/enemies/Enemy');
var Explosion = require('../src/Explosion').Explosion;
var Player = require('../src/Player').Player;
var Point = require('../src/Point').Point;
var World = require('../src/World');

describe('World', function() {
    describe('#ctor()', function() {
        it('should start with no actors', function() {
            var world = new World(100, 200, {});
            expect(world.getActors()).to.be.empty;
        });
    });

    describe('#addActor()', function() {
        it('should increase the number of actors', function() {
            var world = new World(100, 200, {});
            var initialNumberOfActors = world.getActors().length;
            var actor = new Actor(world, new Point(1,1));
            world.addActor(actor);
            expect(world.getActors()).to.have.members([actor]);
        });

        it('should not allow the same actor to be added more than once', function() {
            var world = new World(100, 200, {});
            var actor = new Actor(world, new Point(1,1));
            world.addActor(actor);
            expect(function() { world.addActor(actor); }).to.throw('Cannot add same actor twice.');
        });
    });

    describe('#getDimensions()', function() {
        it('should return the X and Y dimensions of the world in pixels', function() {
            var world = new World(20, 10, {});
            var dimensions = world.getDimensions();
            expect(dimensions).to.deep.equal({width:20, height:10});
        })
    });

    describe('#getActiveEnemies()', function() {
        it('should return empty list when no enemies are present', function() {
            var world = new World(20, 10, {});
            expect(world.getActiveEnemies()).to.be.empty;
        });

        it ('should return only active enemies and skip inactive ones', function() {
            var world = new World(20, 10, {});
            var enemy1 = new Enemy(world, 5, 5);
            world.addActor(enemy1);
            var enemy2 = new Enemy(world, 5, 5);
            enemy2.isActive = function() { return false };
            world.addActor(enemy2);
            expect(world.getActiveEnemies()).to.have.length(1);
        });
    });

    describe('#getActiveExplosions()', function() {
        it('should return empty list when no explosions are present', function() {
            var world = new World(20, 10, {});
            expect(world.getActiveExplosions()).to.be.empty;
        });

        it ('should return only active explosions and skip inactive ones', function() {
            var world = new World(20, 10, {});

            var explosionProperties = {};
            var explosion1 = new Explosion(explosionProperties, {}, world, 5, 5);
            world.addActor(explosion1);
            var explosion2 = new Explosion(explosionProperties, {}, world, 5, 5);
            explosion2.isActive = function() { return false };
            world.addActor(explosion2);
            expect(world.getActiveExplosions()).to.have.length(1);
        });
    });

    describe('#getPlayer()', function() {
        it ('should return null when the player is not present', function() {
            var world = new World(20, 10, {});
            expect(world.getPlayer()).to.be.null;
        });

        it('should return the player if present', function() {
            var world = new World(20, 10, {});
            var player = new Player({}, {}, {}, {}, {}, new Clock());
            world.addActor(player);
            expect(world.getPlayer()).to.be.eql(player);
        })
    });

    describe('#getScoreCounter()', function() {
        it('should return the score counter provided to the constructor', function() {
            var scoreCounter = {};
            var world = new World(20, 20, scoreCounter);
            expect(world.getScoreCounter()).to.be.equal(scoreCounter);
        });
    });

    describe('#tick()', function() {
        it('should call tick on all actors', function() {
            var world = new World(20, 20, {});
            var actor1 = {
                getId: function() { return "actor1"; },
                isActive: function() { return true; },
                tick: function() { this.ticked = true; }
            };
            var actor2 = {
                getId: function () { return "actor2"; },
                isActive: function() { return true; },
                tick: function () { this.ticked = true; }
            };

            world.addActor(actor1);
            world.addActor(actor2);
            world.tick();

            expect(actor1.ticked).to.be.true;
            expect(actor2.ticked).to.be.true;
        });

        it('should remove any actors that become inactive', function() {
            var world = new World(20, 20, {});
            var actor1 = {
                getId: function() { return "actor1"; },
                isActive: function() { return true; },
                tick: function() {}
            };
            var actor2 = {
                getId: function () { return "actor2"; },
                isActive: function() { return false; },
                tick: function () {}
            };

            world.addActor(actor1);
            world.addActor(actor2);
            world.tick();

            expect(world.getActors()).to.have.length(1);
            expect(world.getActors()).to.have.members([actor1]);
            expect(world.getActors()).to.not.have.members([actor2]);
        });
    });
});
