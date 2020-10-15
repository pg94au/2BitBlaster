var expect = require('chai').expect;

var Actor = require('../../src/Actor');
var Bullet = require('../../src/shots/Bullet');
var Clock = require('../../src/timing/Clock').Clock;
var Enemy = require('../../src/enemies/Enemy');
var Saucer = require('../../src/enemies/Saucer');

var AudioPlayerStubBuilder = require('../builders/AudioPlayerStubBuilder');
var EnemyStubBuilder = require('../builders/EnemyStubBuilder');
var WorldStubBuilder = require('../builders/WorldStubBuilder');

describe('Bullet', function() {
    describe('#tick()', function () {
        it('should move the bullet directly upwards', function () {
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                5, 10
            );
            bullet.tick();
            expect(bullet.getCoordinates().x).to.be.equal(5);
            expect(bullet.getCoordinates().y).to.be.below(10);
        });

        it ('should animate the sprite frames', function() {
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                5, 10
            );
            expect(bullet.getImageDetails().currentFrame).to.be.equal(0);
            bullet.tick();
            expect(bullet.getImageDetails().currentFrame).to.be.equal(1);
        });

        it('should recycle sprite frames when animating', function() {
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                5, 10
            );
            var numberOfFrames = bullet.getImageDetails().numberOfFrames;
            for (var i=0; i < numberOfFrames-1; i++) {
                bullet.tick();
            }
            expect(bullet.getImageDetails().currentFrame).to.be.equal(numberOfFrames-1);
            bullet.tick();
            expect(bullet.getImageDetails().currentFrame).to.be.equal(0);
        });

        it('should remain active while it remains within the world', function() {
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                5, 10
            );
            bullet.tick();
            expect(bullet.isActive()).to.be.true;
        });

        it('should become inactive when it leaves the world', function() {
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                5, 0
            );
            bullet.tick();
            expect(bullet.isActive()).to.be.false;
        });

        it('should hit any active enemies within collision distance', function() {
            var hit = false;
            var enemy = new EnemyStubBuilder()
                .withCoordinates(10, 10)
                .acceptingHits(function(shot, damage) { hit = true; })
                .build();
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().returningActiveEnemies([enemy]).build(),
                10, 10
            );
            bullet.tick();
            expect(hit).to.be.true;
        });

        it('should not hit any active enemies outside collision distance', function() {
            var hit = false;
            var enemy = new EnemyStubBuilder()
                .withCoordinates(1000, 1000)
                .withCollisionMask(-5, 5, -5, 5)
                .acceptingHits()
                .build();
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().returningActiveEnemies([enemy]).build(),
                10, 10
            );
            bullet.tick();
            expect(hit).to.be.false;
        });

        it('should hit a target with damage equal to 1', function() {
            var actualDamage = null;
            var enemy = new EnemyStubBuilder()
                .withCoordinates(10, 10)
                .acceptingHits(function(shot, damage) { actualDamage = damage; })
                .build();
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().returningActiveEnemies([enemy]).build(),
                10, 10
            );
            bullet.tick();
            expect(actualDamage).to.be.equal(1);
        });

        it('should become inactive after it has made a successful hit', function() {
            var saucer = new Saucer(
                new AudioPlayerStubBuilder().build(),
                {},
                new Clock(),
                10, 10);
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().returningActiveEnemies([saucer]).build(),
                10, 10
            );
            bullet.tick();
            expect(bullet.isActive()).to.be.false;
        });

        it('should become inactive if it makes an unsuccessful hit', function() {
            var enemy = new EnemyStubBuilder()
                .withCoordinates(10, 10)
                .refusingHits()
                .build();
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().returningActiveEnemies([enemy]).build(),
                10, 10
            );
            bullet.tick();
            expect(bullet.isActive()).to.be.false;
        });

        it('should only be able to hit a single target', function() {
            var enemy1Hit = false;
            var enemy2Hit = false;
            var enemy1 = new EnemyStubBuilder()
                .withCoordinates(10, 10)
                .acceptingHits(function(shot, damage) { enemy1Hit = true; })
                .build();
            var enemy2 = new EnemyStubBuilder()
                .withCoordinates(10, 10)
                .acceptingHits(function(shot, damage) { enemy2Hit = true; })
                .build();
            var bullet = new Bullet(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().returningActiveEnemies([enemy1, enemy2]).build(),
                10, 10
            );
            bullet.tick();
            expect(enemy1Hit).to.not.be.equal(enemy2Hit);
        });

        it('should play a sound on the first tick', function() {
            var audioPlayer = new AudioPlayerStubBuilder().build();
            var bullet = new Bullet(
                audioPlayer,
                new WorldStubBuilder().build(),
                5, 10
            );
            bullet.tick();

            expect(audioPlayer.getPlayedSounds().length).to.be.above(0);
        });
    });
});
