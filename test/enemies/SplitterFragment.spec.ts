import {describe} from 'mocha';
import {expect} from 'chai';

import {AudioPlayer} from "../../src/devices/AudioPlayer";
import {Bullet} from "../../src/shots/Bullet";
import {ClockStub} from "../stubs/ClockStub";
import {Point} from "../../src/Point";
import {ScoreCounter} from "../../src/ScoreCounter";
import {SplitterFragment} from "../../src/enemies/SplitterFragment";
import {World} from '../../src/World';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {PlayerStub} from "../stubs/PlayerStub";

describe('SplitterFragment', () => {
    let audioPlayer: AudioPlayer;
    let clock: ClockStub;
    let scoreCounter: ScoreCounter;
    let world: World;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        scoreCounter = new ScoreCounter();
        world = new World(480, 640, scoreCounter);
    });

    describe('#hitBy()', () => {
        it('should return true for Bullet', () => {
            const bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            world.addActor(bullet);

            const splitterFragment = new SplitterFragment(audioPlayer, world, clock, SplitterFragment.Side.Left, new Point(10, 10));
            expect(splitterFragment.hitBy(bullet, 1)).to.be.true;
        });

        it('should return true for Player', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const splitterFragment = new SplitterFragment(audioPlayer, world, clock, SplitterFragment.Side.Left, new Point(10, 10));
            expect(splitterFragment.hitBy(player, 1)).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const splitterFragment = new SplitterFragment(audioPlayer, world, clock, SplitterFragment.Side.Left, new Point(10, 10));
            splitterFragment.hitBy(player, 1);
            splitterFragment.tick();
            expect(splitterFragment.isActive()).to.be.false;
        });

        it('should remain active after hit if health remains above zero', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const splitterFragment = new SplitterFragment(audioPlayer, world, clock, SplitterFragment.Side.Left, new Point(10, 10));
            splitterFragment.hitBy(player, 0.5);
            player.tick();
            expect(player.isActive()).to.be.true;
        });

        it('should add an explosion when it is destroyed', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const splitterFragment = new SplitterFragment(audioPlayer, world, clock, SplitterFragment.Side.Left, new Point(10, 10));
            splitterFragment.hitBy(player, 1);
            splitterFragment.tick();
            expect(world.getActiveExplosions().length).to.be.equal(1);
        });

        it('should increment the score when it is destroyed', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const splitterFragment = new SplitterFragment(audioPlayer, world, clock, SplitterFragment.Side.Left, new Point(10, 10));
            splitterFragment.hitBy(player, 1);
            splitterFragment.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
