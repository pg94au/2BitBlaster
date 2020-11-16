import {describe} from 'mocha';
import {expect} from 'chai';

import {Actor} from "../../src/Actor";
import {AudioPlayer} from "../../src/devices/AudioPlayer";
import {Bomber} from '../../src/enemies/Bomber';
import {Bullet} from "../../src/shots/Bullet";
import {Explosion} from '../../src/Explosion';
import {Point} from '../../src/Point';
import {ScoreCounter} from '../../src/ScoreCounter';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ClockStub} from "../stubs/ClockStub";
import {WorldStub} from "../stubs/WorldStub";

describe('Bomber', () => {
    let audioPlayer: AudioPlayer;
    let clock: ClockStub;
    let scoreCounter: ScoreCounter;
    let world: WorldStub;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        scoreCounter = new ScoreCounter();
        world = new WorldStub(480, 640, scoreCounter);
    });

    describe('#hit()', () => {
        it('should return true', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            const bomber = new Bomber(audioPlayer, world, clock, 10);
            expect(bomber.hitBy(bullet, 1)).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            const bomber = new Bomber(audioPlayer, world, clock, 10);
            bomber.hitBy(bullet, Bomber.InitialHealth);
            bomber.tick();
            expect(bomber.isActive).to.be.false;
        });

        it('should remain active after hit if health remains above zero', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            const bomber = new Bomber(audioPlayer, world, clock, 10);
            bomber.hitBy(bullet,  Bomber.InitialHealth / 2);
            bomber.tick();
            expect(bomber.isActive).to.be.true;
        });

        it('should add an explosion when it is destroyed', () => {
            let addedActor: Actor | null = null;
            world.onAddActor(actor => { addedActor = actor });

            const bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            const bomber = new Bomber(audioPlayer, world, clock, 10);
            bomber.hitBy(bullet, Bomber.InitialHealth);
            bomber.tick();
            expect(addedActor).to.be.instanceOf(Explosion);
        });

        it('should increment the score when it is destroyed', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            const bomber = new Bomber(audioPlayer, world, clock, 10);
            bomber.hitBy(bullet, Bomber.InitialHealth);
            bomber.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });

        it('should become inactive when it disappears of the side of the screen', () => {
            const bomber = new Bomber(audioPlayer, world, clock, 10);

            const lastVisiblePosition = world.getDimensions().width + bomber.imageDetails.frameWidth - 1;

            while (bomber.coordinates.x < lastVisiblePosition) {
                bomber.tick();
            }

            expect(bomber.isActive).to.be.false;
        });
    });
});
