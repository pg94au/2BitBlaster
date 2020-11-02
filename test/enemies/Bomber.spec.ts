import {describe} from 'mocha';
import {expect} from 'chai';

import {Bomber} from '../../src/enemies/Bomber';
import {Clock} from '../../src/timing/Clock';
import {Explosion} from '../../src/Explosion';
import {Point} from '../../src/Point';
import {ScoreCounter} from '../../src/ScoreCounter';
import {ClockStub} from "../stubs/ClockStub";
import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {Bullet} from "../../src/shots/Bullet";
import {WorldStub} from "../stubs/WorldStub";

describe('Bomber', function() {
    let audioPlayer: any;
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
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            let bomber = new Bomber(audioPlayer, world, clock, 10);
            expect(bomber.hitBy(bullet, 1)).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            let bomber = new Bomber(audioPlayer, world, clock, 10);
            bomber.hitBy(bullet, 3);
            bomber.tick();
            expect(bomber.isActive()).to.be.false;
        });

        it('should remain active after hit if health remains above zero', () => {
            let bomber = new Bomber(audioPlayer, world, clock, 10);
            bomber.hitBy({}, 0.5);
            bomber.tick();
            expect(bomber.isActive()).to.be.true;
        });

        it('should add an explosion when it is destroyed', () => {
            let addedActor: Explosion | null = null;
            world.onAddActor(actor => { addedActor = actor });

            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            let bomber = new Bomber(audioPlayer, world, clock, 10);
            bomber.hitBy(bullet, 1000);
            bomber.tick();
            expect(addedActor).to.be.instanceOf(Explosion);
        });

        it('should increment the score when it is destroyed', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            let bomber = new Bomber(audioPlayer, world, clock, 10);
            bomber.hitBy(bullet, 1000);
            bomber.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });

        it('should become inactive when it disappears of the side of the screen', () => {
            let bomber = new Bomber(audioPlayer, world, clock, 10);

            let lastVisiblePosition = world.getDimensions().width + bomber.getImageDetails().frameWidth - 1;

            while (bomber.getCoordinates().x < lastVisiblePosition) {
                bomber.tick();
            }

            expect(bomber.isActive()).to.be.false;
        });
    });
});
