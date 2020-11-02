import {describe} from 'mocha';
import {expect} from 'chai';

import {Bullet} from "../../src/shots/Bullet";
import {Clock} from '../../src/timing/Clock';
import {Point} from '../../src/Point';
import {Saucer} from '../../src/enemies/Saucer';
import {ScoreCounter} from '../../src/ScoreCounter';
import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ClockStub} from "../stubs/ClockStub";
const World = require('../../src/World');

describe('Saucer', () => {
    let audioPlayer: any;
    let clock: ClockStub;
    let scoreCounter: ScoreCounter;
    let world: any;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        scoreCounter = new ScoreCounter();
        world = new World(480, 640, scoreCounter);
    });

    describe('#hitBy()', () => {
        it('should return true', () => {
            let saucer = new Saucer(audioPlayer, world, clock, new Point(5, 10));
            expect(saucer.hitBy({}, 1)).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let saucer = new Saucer(audioPlayer, world, clock, new Point(5, 10));
            saucer.hitBy(bullet, 1);
            saucer.tick();
            expect(saucer.isActive()).to.be.false;
        });

        it('should remain active after hit if health remains above zero', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let saucer = new Saucer(audioPlayer, world, clock, new Point(5, 10));
            saucer.hitBy(bullet, 0.5);
            saucer.tick();
            expect(saucer.isActive()).to.be.true;
        });

        it('should add an explosion when it is destroyed', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let saucer = new Saucer(audioPlayer, world, clock, new Point(5, 10));
            saucer.hitBy(bullet, 1);
            saucer.tick();
            expect(world.getActiveExplosions().length).to.be.equal(1);
        });

        it('should increment the score when it is destroyed', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            let saucer = new Saucer(audioPlayer, world, clock, new Point(5, 10));
            saucer.hitBy(bullet, 1);
            saucer.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
