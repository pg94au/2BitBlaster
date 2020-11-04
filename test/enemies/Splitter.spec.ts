import {describe} from 'mocha';
import {expect} from 'chai';

import {Bullet} from "../../src/shots/Bullet";
import {Point} from "../../src/Point";
import {ScoreCounter} from "../../src/ScoreCounter";
import {Shrapnel} from "../../src/shots/Shrapnel";
import {Splitter} from "../../src/enemies/Splitter";
import {SplitterFragment} from '../../src/enemies/SplitterFragment';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ClockStub} from "../stubs/ClockStub";
import {PlayerStub} from "../stubs/PlayerStub";

const World = require('../../src/World');

describe('Splitter', () => {
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
        it('should return true for Bullet', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            let splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            expect(splitter.hitBy(bullet, 1)).to.be.true;
        });

        it('should return true for Player', () => {
            let player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            let splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            expect(splitter.hitBy(player, 1)).to.be.true;
        });
    });

    describe('#dropBomb()', () => {
       it('should drop two bits of shrapnel', () => {
           let splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
           splitter.dropBomb();

           expect(world.getActors().filter((actor: any) => { return (actor instanceof Shrapnel) }).length).to.be.equal(2);
       });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            let player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            let splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            splitter.hitBy(player, 1);
            splitter.tick();
            expect(splitter.isActive()).to.be.false;
        });

        it('should remain active after hit if health remains above zero', () => {
            let player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            let splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            splitter.hitBy(player, 0.5);
            player.tick();
            expect(player.isActive()).to.be.true;
        });

        it('should add an explosion when it is destroyed', () => {
            let player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            let splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            splitter.hitBy(player, 1);
            splitter.tick();
            expect(world.getActiveExplosions().length).to.be.equal(1);
        });

        it('should add two new fragments when it is destroyed', () => {
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            let splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            splitter.hitBy(bullet, 1);
            splitter.tick();

            expect(world.getActors().filter((actor: any) => { return (actor instanceof SplitterFragment)}).length).to.be.equal(2);
        });

        it('should increment the score when it is destroyed', () => {
            let player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            let splitter = new Splitter(audioPlayer, world, clock, new Point(10, 10));
            splitter.hitBy(player, 1);
            splitter.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
