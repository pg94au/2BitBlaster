import {describe} from 'mocha';
import {expect} from 'chai';

import {AudioPlayer} from "../../src/devices/AudioPlayer";
import {Bullet} from "../../src/shots/Bullet";
import {Dimensions} from "../../src/Dimensions";
import {Point} from '../../src/Point';
import {Saucer} from '../../src/enemies/Saucer';
import {ScoreCounter} from '../../src/ScoreCounter';
import {World} from '../../src/World';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ClockStub} from "../stubs/ClockStub";
import {ActorStub} from "../stubs/ActorStub";

describe('Saucer', () => {
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

    describe('#hitBy()', () => {
        it('should return true', () => {
            const saucer = new Saucer(audioPlayer, world, clock, new Point(5, 10));
            const actor = new ActorStub(world, new Point(5, 10));
            world.addActor(actor);

            expect(saucer.hitBy(actor, 1)).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const saucer = new Saucer(audioPlayer, world, clock, new Point(5, 10));
            saucer.hitBy(bullet, Saucer.InitialHealth);
            saucer.tick();
            expect(saucer.isActive).to.be.false;
        });

        it('should remain active after hit if health remains above zero', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const saucer = new Saucer(audioPlayer, world, clock, new Point(5, 10));
            saucer.hitBy(bullet, Saucer.InitialHealth / 2);
            saucer.tick();
            expect(saucer.isActive).to.be.true;
        });

        it('should add an explosion when it is destroyed', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const saucer = new Saucer(audioPlayer, world, clock, new Point(5, 10));
            saucer.hitBy(bullet, Saucer.InitialHealth);
            saucer.tick();
            expect(world.activeExplosions.length).to.be.equal(1);
        });

        it('should increment the score when it is destroyed', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const saucer = new Saucer(audioPlayer, world, clock, new Point(5, 10));
            saucer.hitBy(bullet, Saucer.InitialHealth);
            saucer.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
