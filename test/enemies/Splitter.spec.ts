import {describe} from 'mocha';
import {expect} from 'chai';

import {Actor} from "../../src/Actor";
import {AudioPlayer} from "../../src/devices/AudioPlayer";
import {Bullet} from "../../src/shots/Bullet";
import {Dimensions} from "../../src/Dimensions";
import {Point} from "../../src/Point";
import {ScoreCounter} from "../../src/ScoreCounter";
import {Shrapnel} from "../../src/shots/Shrapnel";
import {Splitter} from "../../src/enemies/Splitter";
import {SplitterFragment} from '../../src/enemies/SplitterFragment';
import {World} from '../../src/World';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ClockStub} from "../stubs/ClockStub";
import {PlayerStub} from "../stubs/PlayerStub";

describe('Splitter', () => {
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
        it('should return true for Bullet', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            const splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            expect(splitter.hitBy(bullet, Splitter.InitialHealth)).to.be.true;
        });

        it('should return true for Player', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            expect(splitter.hitBy(player, Splitter.InitialHealth)).to.be.true;
        });
    });

    describe('#dropBomb()', () => {
       it('should drop two bits of shrapnel', () => {
           const splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
           (splitter as any).dropBomb();

           expect(world.getActors().filter((actor: Actor) => { return (actor instanceof Shrapnel) }).length).to.be.equal(2);
       });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            splitter.hitBy(player, Splitter.InitialHealth);
            splitter.tick();
            expect(splitter.isActive).to.be.false;
        });

        it('should remain active after hit if health remains above zero', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            splitter.hitBy(player, Splitter.InitialHealth / 2);
            player.tick();
            expect(player.isActive).to.be.true;
        });

        it('should add an explosion when it is destroyed', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            splitter.hitBy(player, Splitter.InitialHealth);
            splitter.tick();
            expect(world.getActiveExplosions().length).to.be.equal(1);
        });

        it('should add two new fragments when it is destroyed', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            const splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            splitter.hitBy(bullet, Splitter.InitialHealth);
            splitter.tick();

            expect(world.getActors().filter((actor: Actor) => { return (actor instanceof SplitterFragment)}).length).to.be.equal(2);
        });

        it('should increment the score when it is destroyed', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            splitter.hitBy(player, Splitter.InitialHealth);
            splitter.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
