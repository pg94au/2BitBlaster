var expect = require('chai').expect;

var Explosion = require('../src/Explosion').Explosion;
var AudioPlayerStubBuilder = require('./builders/AudioPlayerStubBuilder');

describe('Explosion', function() {
    describe('#getImageDetails()', function () {
        it('should return image properties as provided', function() {
            var explosionProperties = {
                imageName: 'imagename',
                numberOfFrames: 3,
                frameWidth: 25,
                frameSpeed: 1
            };
            var explosion = new Explosion(explosionProperties, {}, {}, 5, 10);
            var imageDetails = explosion.getImageDetails();
            expect(imageDetails.name).to.be.equal('imagename');
            expect(imageDetails.numberOfFrames).to.be.equal(3);
            expect(imageDetails.frameWidth).to.be.equal(25);
        });

        it('current frame number should initially be zero', function () {
            var explosionProperties = {
                imageName: 'imagename',
                numberOfFrames: 3,
                frameWidth: 25,
                frameSpeed: 1
            };
            var explosion = new Explosion(explosionProperties, {}, {}, 5, 10);
            expect(explosion.getImageDetails().currentFrame).to.be.equal(0);
        });
    });

    describe('#hitBy()', function() {
        it('should not be possible to hit an explosion', function() {
            var explosionProperties = {
                imageName: 'imagename',
                numberOfFrames: 3,
                frameWidth: 25,
                frameSpeed: 1
            };
            var explosion = new Explosion(explosionProperties, {}, {}, 5, 10);

            expect(explosion.hitBy({}, 1)).to.be.false;
        });
    });

    describe('#tick()', function() {
        it('should animate at the requested speed', function() {
            var explosionProperties = {
                imageName: 'imagename',
                numberOfFrames: 3,
                frameWidth: 25,
                frameSpeed: .4
            };
            var explosion = new Explosion(explosionProperties, {}, {}, 5, 10);
            explosion.tick();
            expect(explosion.getImageDetails().currentFrame).to.be.equal(0);
            explosion.tick();
            expect(explosion.getImageDetails().currentFrame).to.be.equal(0);
            explosion.tick();
            expect(explosion.getImageDetails().currentFrame).to.be.equal(1);
        });

        it('should become inactive after one cycle through its image frames', function() {
            var explosionProperties = {
                imageName: 'imagename',
                numberOfFrames: 3,
                frameWidth: 25,
                frameSpeed: 1
            };
            var explosion = new Explosion(explosionProperties, {}, {}, 5, 10);
            explosion.tick();
            explosion.tick();
            explosion.tick();
            expect(explosion.isActive()).to.be.false;
        });
        
        it('should play sound on the first tick if one is specified', function() {
            var explosionProperties = {
                imageName: 'imagename',
                numberOfFrames: 3,
                frameWidth: 25,
                frameSpeed: 1,
                soundName: 'soundname'
            };
            var audioPlayer = new AudioPlayerStubBuilder().build();

            var explosion = new Explosion(explosionProperties, audioPlayer, {}, 5, 10);
            explosion.tick();

            expect(audioPlayer.getPlayedSounds()).to.be.eql(['soundname']);
        });

        it('should not play a sound on the first tick if one is not specified', function() {
            var explosionProperties = {
                imageName: 'imagename',
                numberOfFrames: 3,
                frameWidth: 25,
                frameSpeed: 1
            };
            var audioPlayer = new AudioPlayerStubBuilder().build();

            var explosion = new Explosion(explosionProperties, audioPlayer, {}, 5, 10);
            explosion.tick();

            expect(audioPlayer.getPlayedSounds()).to.be.empty;
        });
    });
});
