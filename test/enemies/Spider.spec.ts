import {describe} from 'mocha';
import {expect} from 'chai';

import {AudioPlayer} from "../../src/devices/AudioPlayer";
import {Bullet} from "../../src/shots/Bullet";
import {Dimensions} from "../../src/Dimensions";
import {Point} from '../../src/Point';
import {Spider} from '../../src/enemies/Spider';
import {ScoreCounter} from '../../src/ScoreCounter';
import {World} from '../../src/World';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ClockStub} from "../stubs/ClockStub";
import {ActorStub} from "../stubs/ActorStub";

describe('Spider', () => {
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
            const spider = new Spider(audioPlayer, world, clock, new Point(5, 10), new Point(100, 100));
            const actor = new ActorStub(world, new Point(5, 10));
            world.addActor(actor);

            expect(spider.hitBy(actor, 1)).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const spider = new Spider(audioPlayer, world, clock, new Point(5, 10), new Point(100, 100));
            spider.hitBy(bullet, Spider.InitialHealth);
            spider.tick();
            expect(spider.isActive).to.be.false;
        });

        it('should remain active after hit if health remains above zero', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const spider = new Spider(audioPlayer, world, clock, new Point(5, 10), new Point(100, 100));
            spider.hitBy(bullet, Spider.InitialHealth / 2);
            spider.tick();
            expect(spider.isActive).to.be.true;
        });

        it('should add an explosion when it is destroyed', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const spider = new Spider(audioPlayer, world, clock, new Point(5, 10), new Point(100, 100));
            spider.hitBy(bullet, Spider.InitialHealth);
            spider.tick();
            expect(world.activeExplosions.length).to.be.equal(1);
        });

        it('should increment the score when it is destroyed', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            world.addActor(bullet);

            const spider = new Spider(audioPlayer, world, clock, new Point(5, 10), new Point(100, 100));
            spider.hitBy(bullet, Spider.InitialHealth);
            spider.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
