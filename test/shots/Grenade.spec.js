var _ = require('underscore');
var expect = require('chai').expect;

var Actor = require('../../src/Actor');
var Grenade = require('../../src/shots/Grenade');
var Player = require('../../src/Player');
var Point = require('../../src/Point').Point;
var Shrapnel = require('../../src/shots/Shrapnel');

var AudioPlayerStubBuilder = require('../builders/AudioPlayerStubBuilder');
var PlayerStubBuilder = require('../builders/PlayerStubBuilder');
var WorldStubBuilder = require('../builders/WorldStubBuilder');

describe('Grenade', function() {
    describe('#tick()', function () {
        it('should move the grenade directly downwards', function () {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var grenade = new Grenade(audioPlayer, worldStub, new Point(5, 10));
            grenade.tick();
            expect(grenade.getCoordinates().x).to.be.equal(5);
            expect(grenade.getCoordinates().y).to.be.above(10);
        });

        it ('should animate the sprite frames', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var grenade = new Grenade(audioPlayer, worldStub, new Point(5, 10));
            expect(grenade.getImageDetails().currentFrame).to.be.equal(0);
            grenade.tick();
            expect(grenade.getImageDetails().currentFrame).to.be.equal(1);
        });

        it('should remain active before moving a distance of 200', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var grenade = new Grenade(audioPlayer, worldStub, new Point(5, 10));
            grenade.tick();
            expect(grenade.isActive()).to.be.true;
        });

        it('should become inactive after it has moved more than a distance of 200', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var grenade = new Grenade(audioPlayer, worldStub, new Point(5, 10));
            while (grenade._location.y < 210) {
                grenade.tick();
            }

            expect(grenade.isActive()).to.be.false;
        });

        it('should add pieces of shrapnel when it explodes', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var grenade = new Grenade(audioPlayer, worldStub, new Point(5, 10));
            while (grenade._location.y < 210) {
                grenade.tick();
            }

            var shrapnel = _.filter(worldStub.getActors(), function(a) { return (a instanceof Shrapnel); });

            expect(shrapnel.length).to.be.above(0);
        });

        it('should become inactive if it leaves the world', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var grenade = new Grenade(audioPlayer, worldStub, new Point(5, worldStub.getDimensions().height));
            grenade.tick();
            expect(grenade.isActive()).to.be.false;
        });

        it('should hit an active player within collision distance', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).build();
            worldStub.addActor(playerStub);

            var grenade = new Grenade(audioPlayer, worldStub, new Point(10, 10));
            grenade.tick();
            expect(playerStub.hitFor).to.not.be.empty;
        });

        it('should not hit an active player outside collision distance', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(1000, 1000).build();
            worldStub.addActor(playerStub);

            var grenade = new Grenade(audioPlayer, worldStub, new Point(10, 10));
            grenade.tick();
            expect(playerStub.hitFor).to.be.empty;
        });

        it('should hit the player with damage equal to 3', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).build();
            worldStub.addActor(playerStub);

            var grenade = new Grenade(audioPlayer, worldStub, new Point(10, 10));
            grenade.tick();
            expect(playerStub.hitFor).to.be.eql([3]);
        });

        it('should become inactive after it has made a successful hit', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).build();
            worldStub.addActor(playerStub);

            var grenade = new Grenade(audioPlayer, worldStub, new Point(10, 10));
            grenade.tick();
            expect(grenade.isActive()).to.be.false;
        });

        it('should become inactive if it makes an unsuccessful hit', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).ignoringHits().build();
            worldStub.addActor(playerStub);

            var grenade = new Grenade(audioPlayer, worldStub, new Point(10, 10));
            grenade.tick();
            expect(grenade.isActive()).to.be.false;
        });

        it('should remain active when there is no player', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var grenade = new Grenade(audioPlayer, worldStub, new Point(10, 10));
            grenade.tick();
            expect(grenade.isActive()).to.be.true;
        });

        it('should play a sound on the first tick', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var grenade = new Grenade(audioPlayer, worldStub, new Point(10, 10));
            grenade.tick();
            expect(audioPlayer.getPlayedSounds().length).to.be.above(0);
        });
    });
});
