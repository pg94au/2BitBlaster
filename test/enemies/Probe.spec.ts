import {describe} from 'mocha';
import {expect} from 'chai';

import {AudioPlayer} from "../../src/devices/AudioPlayer";
import {Bullet} from "../../src/shots/Bullet";
import {Dimensions} from "../../src/Dimensions";
import {Point} from '../../src/Point';
import {Probe} from '../../src/enemies/Probe';
import {ScoreCounter} from '../../src/ScoreCounter';
import {World} from '../../src/World';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ClockStub} from "../stubs/ClockStub";

describe('Probe', () => {
    let audioPlayer: AudioPlayer;
    let clock: ClockStub;
    let scoreCounter: ScoreCounter;
    let world: World;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        scoreCounter = new ScoreCounter();
        world = new World(new Dimensions(480, 640), scoreCounter);
    });

    describe('#imageDetails', () => {
        it('should return zero frame index when probe is at full health', () => {
            const probe = new Probe(audioPlayer, world, clock, new Point(5, 10));

            expect(probe.imageDetails.currentFrame).equal(0);
        });

        it('should increment frame index as health decreases', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const probe = new Probe(audioPlayer, world, clock, new Point(5, 10));
            probe.hitBy(bullet, 1);

            expect(probe.imageDetails.currentFrame).above(0);
        });

        it('should not increment frame index further upon reaching zero health', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const probe = new Probe(audioPlayer, world, clock, new Point(5, 10));

            // Hit up to one point left.
            probe.hitBy(bullet, Probe.InitialHealth - 1);
            const initialFrame = probe.imageDetails.currentFrame;

            // Hit again to drop to zero.
            probe.hitBy(bullet, 1);

            expect(probe.imageDetails.currentFrame).to.not.be.above(initialFrame);
        });
    });

    describe('#hitBy()', () => {
        it('should return true', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const probe = new Probe(audioPlayer, world, clock, new Point(5, 10));
            expect(probe.hitBy(bullet, 1)).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const probe = new Probe(audioPlayer, world, clock, new Point(5, 10));
            probe.hitBy(bullet, Probe.InitialHealth);
            probe.tick();
            expect(probe.isActive).to.be.false;
        });

        it('should remain active after hit if health remains above zero', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const probe = new Probe(audioPlayer, world, clock, new Point(5, 10));
            probe.hitBy(bullet, Probe.InitialHealth / 2);
            probe.tick();
            expect(probe.isActive).to.be.true;
        });

        it('should add an explosion when it is destroyed', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const probe = new Probe(audioPlayer, world, clock, new Point(5, 10));

            probe.hitBy(bullet, Probe.InitialHealth);
            probe.tick();

            expect(world.getActiveExplosions().length).to.be.equal(1);
        });

        it('should increment the score when it is destroyed', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const probe = new Probe(audioPlayer, world, clock, new Point(5, 10));
            probe.hitBy(bullet, Probe.InitialHealth);
            probe.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
