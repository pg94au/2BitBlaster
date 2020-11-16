import {describe} from 'mocha';
import {expect} from 'chai';

import {Explosion} from '../src/Explosion';
import {ExplosionProperties} from "../src/ExplosionProperties";
import {Point} from "../src/Point";
import {ScoreCounter} from "../src/ScoreCounter";
import {World} from '../src/World';

import {AudioPlayerStub} from "./stubs/AudioPlayerStub";
import {ClockStub} from "./stubs/ClockStub";
import {ShotStub} from "./stubs/ShotStub";

describe('Explosion', () => {
    let audioPlayer: AudioPlayerStub;
    let clock: ClockStub;
    let scoreCounter: ScoreCounter;
    let world: World;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        scoreCounter = new ScoreCounter();
        world = new World(480, 640, scoreCounter);
    });

    describe('#imageDetails', () => {
        it('should return image properties as provided', () => {
            const explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1,
                'soundname'
            );
            const explosion = new Explosion(explosionProperties, audioPlayer, world, new Point(5, 10));
            const imageDetails = explosion.imageDetails;

            expect(imageDetails.name).to.be.equal('imagename');
            expect(imageDetails.numberOfFrames).to.be.equal(3);
            expect(imageDetails.frameWidth).to.be.equal(25);
        });

        it('current frame number should initially be zero', () => {
            const explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1,
                'soundname'
            );
            const explosion = new Explosion(explosionProperties, audioPlayer, world, new Point(5, 10));

            expect(explosion.imageDetails.currentFrame).to.be.equal(0);
        });
    });

    describe('#hitBy()', () => {
        it('should not be possible to hit an explosion', () => {
            const explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1,
                'soundname'
            );
            const explosion = new Explosion(explosionProperties, audioPlayer, world, new Point(5, 10));

            const shot = new ShotStub(world,  new Point(5, 10));

            expect(explosion.hitBy(shot, 1)).to.be.false;
        });
    });

    describe('#tick()', () => {
        it('should animate at the requested speed', () => {
            const explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                .4,
                'soundname'
            );
            const explosion = new Explosion(explosionProperties, new AudioPlayerStub(), world, new Point(5, 10));
            explosion.tick();
            expect(explosion.imageDetails.currentFrame).to.be.equal(0);
            explosion.tick();
            expect(explosion.imageDetails.currentFrame).to.be.equal(0);
            explosion.tick();
            expect(explosion.imageDetails.currentFrame).to.be.equal(1);
        });

        it('should become inactive after one cycle through its image frames', () => {
            const explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1,
                'soundname'
            );
            const explosion = new Explosion(explosionProperties, new AudioPlayerStub(), world, new Point(5, 10));
            explosion.tick();
            explosion.tick();
            explosion.tick();

            expect(explosion.isActive()).to.be.false;
        });

        it('should play sound on the first tick if one is specified', () => {
            const explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1,
                'soundname'
            );

            const playedSounds: string[] = [];
            audioPlayer.onPlay((soundName) => playedSounds.push(soundName));

            const explosion = new Explosion(explosionProperties, audioPlayer, world, new Point(5, 10));
            explosion.tick();

            expect(playedSounds).to.be.eql(['soundname']);
        });

        it('should not play a sound on the first tick if one is not specified', () => {
            const explosionProperties = new ExplosionProperties(
                'imagename',
                3,
                25,
                1
            );
            const playedSounds: string[] = [];
            audioPlayer.onPlay((soundName) => playedSounds.push(soundName));

            const explosion = new Explosion(explosionProperties, audioPlayer, world, new Point(5, 10));
            explosion.tick();

            expect(playedSounds).to.be.empty;
        });
    });
});
