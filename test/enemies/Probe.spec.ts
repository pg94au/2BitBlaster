import {describe} from 'mocha';
import {expect} from 'chai';

import {Bullet} from "../../src/shots/Bullet";
import {Point} from '../../src/Point';
import {Probe} from '../../src/enemies/Probe';
import {ScoreCounter} from '../../src/ScoreCounter';
import {World} from '../../src/World';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ClockStub} from "../stubs/ClockStub";

describe('Probe', () => {
    let audioPlayer: any;
    let clock: ClockStub;
    let scoreCounter: ScoreCounter;
    let world: World;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        scoreCounter = new ScoreCounter();
        world = new World(480, 640, scoreCounter);
    });

    describe('#getImageDetails', () => {
        it('should return zero frame index when probe is at full health', () => {
            let probe = new Probe(audioPlayer, world, clock, new Point(5, 10));

            expect(probe.getImageDetails().currentFrame).equal(0);
        });

        it('should increment frame index as health decreases', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let probe = new Probe(audioPlayer, world, clock, new Point(5, 10));
            probe.hitBy(bullet, 1);

            expect(probe.getImageDetails().currentFrame).above(0);
        });

        it('should not increment frame index further upon reaching zero health', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let probe = new Probe(audioPlayer, world, clock, new Point(5, 10));

            // Hit up to one point left.
            probe.hitBy(bullet, Probe.InitialHealth - 1);
            let initialFrame = probe.getImageDetails().currentFrame;

            // Hit again to drop to zero.
            probe.hitBy(bullet, 1);

            expect(probe.getImageDetails().currentFrame).to.not.be.above(initialFrame);
        });
    });

    describe('#hitBy()', () => {
        it('should return true', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let probe = new Probe(audioPlayer, world, clock, new Point(5, 10));
            expect(probe.hitBy(bullet, 1)).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let probe = new Probe(audioPlayer, world, clock, new Point(5, 10));
            probe.hitBy(bullet, Probe.InitialHealth);
            probe.tick();
            expect(probe.isActive()).to.be.false;
        });

        it('should remain active after hit if health remains above zero', function() {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let probe = new Probe(audioPlayer, world, clock, new Point(5, 10));
            probe.hitBy(bullet, Probe.InitialHealth - 0.5);
            probe.tick();
            expect(probe.isActive()).to.be.true;
        });

        it('should add a new explosion to the world', function() {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let probe = new Probe(audioPlayer, world, clock, new Point(5, 10));

            probe.hitBy(bullet, Probe.InitialHealth);
            probe.tick();

            expect(world.getActiveExplosions().length).to.be.equal(1);
        });

        it('should increment the score when it is destroyed', function() {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let probe = new Probe(audioPlayer, world, clock, new Point(5, 10));
            probe.hitBy(bullet, 1000);
            probe.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
