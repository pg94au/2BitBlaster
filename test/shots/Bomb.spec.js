var expect = require('chai').expect;

var Actor = require('../../src/Actor');
var Bomb = require('../../src/shots/Bomb');
var Player = require('../../src/Player');

var AudioPlayerStubBuilder = require('../builders/AudioPlayerStubBuilder');
var PlayerStubBuilder = require('../builders/PlayerStubBuilder');
var WorldStubBuilder = require('../builders/WorldStubBuilder');

describe('Bomb', function() {
    describe('#tick()', function () {
        it('should move the bomb directly downwards', function () {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var bomb = new Bomb(audioPlayer, worldStub, 5, 10);
            bomb.tick();
            expect(bomb.getCoordinates().x).to.be.equal(5);
            expect(bomb.getCoordinates().y).to.be.above(10);
        });

        it ('should animate the sprite frames', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var bomb = new Bomb(audioPlayer, worldStub, 5, 10);
            expect(bomb.getImageDetails().currentFrame).to.be.equal(0);
            bomb.tick();
            expect(bomb.getImageDetails().currentFrame).to.be.equal(1);
        });

        it('should recycle sprite frames when animating', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var bomb = new Bomb(audioPlayer, worldStub, 5, 10);
            var numberOfFrames = bomb.getImageDetails().numberOfFrames;
            for (var i=0; i < numberOfFrames-1; i++) {
                bomb.tick();
            }
            expect(bomb.getImageDetails().currentFrame).to.be.equal(numberOfFrames-1);
            bomb.tick();
            expect(bomb.getImageDetails().currentFrame).to.be.equal(0);
        });

        it('should remain active while it remains within the world', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var bomb = new Bomb(audioPlayer, worldStub, 5, 10);
            bomb.tick();
            expect(bomb.isActive()).to.be.true;
        });

        it('should become inactive when it leaves the world', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var bomb = new Bomb(audioPlayer, worldStub, 5, worldStub.getDimensions().height - 1);
            bomb.tick();
            expect(bomb.isActive()).to.be.false;
        });

        it('should hit an active player within collision distance', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).build();
            worldStub.addActor(playerStub);

            var bomb = new Bomb(audioPlayer, worldStub, 10, 10);
            bomb.tick();
            expect(playerStub.hitFor).to.not.be.empty;
        });

        it('should not hit an active player outside collision distance', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(1000, 1000).build();
            worldStub.addActor(playerStub);

            var bomb = new Bomb(audioPlayer, worldStub, 10, 10);
            bomb.tick();
            expect(playerStub.hitFor).to.be.empty;
        });

        it('should hit the player with damage equal to 1', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).build();
            worldStub.addActor(playerStub);

            var bomb = new Bomb(audioPlayer, worldStub, 10, 10);
            bomb.tick();
            expect(playerStub.hitFor).to.be.eql([1]);
        });

        it('should become inactive after it has made a successful hit', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).build();
            worldStub.addActor(playerStub);

            var bomb = new Bomb(audioPlayer, worldStub, 10, 10);
            bomb.tick();
            expect(bomb.isActive()).to.be.false;
        });

        it('should become inactive if it makes an unsuccessful hit', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();
            var playerStub = new PlayerStubBuilder().withCoordinates(10, 10).ignoringHits().build();
            worldStub.addActor(playerStub);

            var bomb = new Bomb(audioPlayer, worldStub, 10, 10);
            bomb.tick();
            expect(bomb.isActive()).to.be.false;
        });

        it('should remain active when there is no player', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var bomb = new Bomb(audioPlayer, worldStub, 10, 10);
            bomb.tick();
            expect(bomb.isActive()).to.be.true;
        });

        it('should play a sound on the first tick', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var worldStub = new WorldStubBuilder().build();

            var bomb = new Bomb(audioPlayer, worldStub, 10, 10);
            bomb.tick();
            expect(audioPlayer.getPlayedSounds().length).to.be.above(0);
        });
    });
});
