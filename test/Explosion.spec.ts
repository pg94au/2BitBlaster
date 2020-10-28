import {describe} from 'mocha';
import {expect} from 'chai';

import {Explosion} from '../src/Explosion';
import {ExplosionProperties} from "../src/ExplosionProperties";
import {Point} from "../src/Point";
import {AudioPlayerStub} from "./stubs/AudioPlayerStub";

describe('Explosion', () => {
    describe('#getImageDetails()', () => {
        it('should return image properties as provided', () => {
            let explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1,
                'soundname'
            );
            let explosion = new Explosion(explosionProperties, {}, {}, new Point(5, 10));
            let imageDetails = explosion.imageDetails;

            expect(imageDetails.name).to.be.equal('imagename');
            expect(imageDetails.numberOfFrames).to.be.equal(3);
            expect(imageDetails.frameWidth).to.be.equal(25);
        });

        it('current frame number should initially be zero', () => {
            let explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1,
                'soundname'
            );
            let explosion = new Explosion(explosionProperties, {}, {}, new Point(5, 10));

            expect(explosion.imageDetails.currentFrame).to.be.equal(0);
        });
    });

    describe('#hitBy()', () => {
        it('should not be possible to hit an explosion', () => {
            let explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1,
                'soundname'
            );
            let explosion = new Explosion(explosionProperties, {}, {}, new Point(5, 10));

            expect(explosion.hitBy({}, 1)).to.be.false;
        });
    });

    describe('#tick()', () => {
        it('should animate at the requested speed', () => {
            let explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                .4,
                'soundname'
            );
            let explosion = new Explosion(explosionProperties, new AudioPlayerStub(), {}, new Point(5, 10));
            explosion.tick();
            expect(explosion.imageDetails.currentFrame).to.be.equal(0);
            explosion.tick();
            expect(explosion.imageDetails.currentFrame).to.be.equal(0);
            explosion.tick();
            expect(explosion.imageDetails.currentFrame).to.be.equal(1);
        });

        it('should become inactive after one cycle through its image frames', () => {
            let explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1,
                'soundname'
            );
            let explosion = new Explosion(explosionProperties, new AudioPlayerStub(), {}, new Point(5, 10));
            explosion.tick();
            explosion.tick();
            explosion.tick();

            expect(explosion.isActive()).to.be.false;
        });
        
        it('should play sound on the first tick if one is specified', () => {
            let explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1,
                'soundname'
            );

            let playedSounds: string[] = [];
            let audioPlayer = new AudioPlayerStub().onPlay((soundName) => playedSounds.push(soundName));

            let explosion = new Explosion(explosionProperties, audioPlayer, {}, new Point(5, 10));
            explosion.tick();

            expect(playedSounds).to.be.eql(['soundname']);
        });

        it('should not play a sound on the first tick if one is not specified', () => {
            let explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1
            );
            let playedSounds: string[] = [];
            let audioPlayer = new AudioPlayerStub().onPlay((soundName) => playedSounds.push(soundName));

            let explosion = new Explosion(explosionProperties, audioPlayer, {}, new Point(5, 10));
            explosion.tick();

            expect(playedSounds).to.be.empty;
        });
    });
});
