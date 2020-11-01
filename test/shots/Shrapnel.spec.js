var expect = require('chai').expect;

var Actor = require('../../src/Actor');
var Player = require('../../src/Player');
var Point = require('../../src/Point').Point;
var Shrapnel = require('../../src/shots/Shrapnel').Shrapnel;

var AudioPlayerStubBuilder = require('../builders/AudioPlayerStubBuilder');
var PlayerStubBuilder = require('../builders/PlayerStubBuilder');
var WorldStubBuilder = require('../builders/WorldStubBuilder');

describe('Shrapnel', function() {
    describe('#tick()', function () {
        it('should move the shrapnel down when specified by the trajectory', function () {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(5, 10), 270);
            shrapnel.tick();
            expect(shrapnel.getCoordinates().x).to.be.equal(5);
            expect(shrapnel.getCoordinates().y).to.be.above(10);
        });

        it('should move the shrapnel right when specified by the trajectory', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(5, 10), 0);
            shrapnel.tick();
            expect(shrapnel.getCoordinates().x).to.be.above(5);
            expect(shrapnel.getCoordinates().y).to.be.equal(10);
        });

        it ('should move the shrapnel diagonally left and up when specified by the trajectory', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(10, 10), 135);
            shrapnel.tick();
            expect(shrapnel.getCoordinates().x).to.be.below(10);
            expect(shrapnel.getCoordinates().y).to.be.below(10);
            expect(shrapnel.getCoordinates().x).to.be.equal(shrapnel.getCoordinates().y);
        });

        it ('should animate the sprite frames', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(5, 10), 270);
            expect(shrapnel.getImageDetails().currentFrame).to.be.equal(0);
            shrapnel.tick();
            expect(shrapnel.getImageDetails().currentFrame).to.be.equal(1);
        });

        it('should recycle sprite frames when animating', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(5, 10), 270);
            var numberOfFrames = shrapnel.getImageDetails().numberOfFrames;
            for (var i=0; i < numberOfFrames-1; i++) {
                shrapnel.tick();
            }
            expect(shrapnel.getImageDetails().currentFrame).to.be.equal(numberOfFrames-1);
            shrapnel.tick();
            expect(shrapnel.getImageDetails().currentFrame).to.be.equal(0);
        });

        it('should remain active while it remains within the world', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(5, 10), 270);
            shrapnel.tick();
            expect(shrapnel.isActive()).to.be.true;
        });

        it('should become inactive when it leaves the world', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(5, 640), 270);
            shrapnel.tick();
            expect(shrapnel.isActive()).to.be.false;
        });

        it('should hit an active player within collision distance', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).build();
            worldStub.addActor(playerStub);

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(10, 10), 270);
            shrapnel.tick();
            expect(playerStub.hitFor).to.not.be.empty;
        });

        it('should not hit an active player outside collision distance', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(1000, 1000).build();
            worldStub.addActor(playerStub);

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(10, 10), 270);
            shrapnel.tick();
            expect(playerStub.hitFor).to.be.empty;
        });

        it('should hit the player with damage equal to 1', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).build();
            worldStub.addActor(playerStub);

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(10, 10), 270);
            shrapnel.tick();
            expect(playerStub.hitFor).to.be.eql([1]);
        });

        it('should become inactive after it has made a successful hit', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).build();
            worldStub.addActor(playerStub);

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(10, 10), 270);
            shrapnel.tick();
            expect(shrapnel.isActive()).to.be.false;
        });

        it('should become inactive if it makes an unsuccessful hit', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).ignoringHits().build();
            worldStub.addActor(playerStub);

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(10, 10), 270);
            shrapnel.tick();
            expect(shrapnel.isActive()).to.be.false;
        });

        it('should remain active when there is no player', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(10, 10), 270);
            shrapnel.tick();
            expect(shrapnel.isActive()).to.be.true;
        });

        it('should play a sound on the first tick', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var shrapnel = new Shrapnel(audioPlayer, worldStub, new Point(10, 10), 270);
            shrapnel.tick();
            expect(audioPlayer.getPlayedSounds()).to.be.eql(['bomb_drop']);
        });
    });
});
