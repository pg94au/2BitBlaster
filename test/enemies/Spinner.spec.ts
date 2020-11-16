import {describe} from 'mocha';
import {expect} from 'chai';
import {ClockStub} from "../stubs/ClockStub";
import {Dimensions} from "../../src/Dimensions";
import {Point} from "../../src/Point";
import {Spinner} from "../../src/enemies/Spinner";
import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ScoreCounter} from "../../src/ScoreCounter";
import {PlayerStub} from "../stubs/PlayerStub";
import {Bullet} from "../../src/shots/Bullet";
import {World} from '../../src/World';

describe('Spinner', () => {
    let audioPlayer: AudioPlayerStub;
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

            const spinner = new Spinner(audioPlayer, world, clock, new Point(10, 10), Spinner.Pattern.Type1, Spinner.Bias.Left);
            expect(spinner.hitBy(bullet, 1)).to.be.true;
        });

        it('should return true for Player', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const spinner = new Spinner(audioPlayer, world, clock, new Point(10, 10), Spinner.Pattern.Type1, Spinner.Bias.Left);
            expect(spinner.hitBy(player, 1)).to.be.true;
        });
    });

    describe('#tick()', () => {
        it('should de-activate after health reaches zero', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const spinner = new Spinner(audioPlayer, world, clock, new Point(10, 10), Spinner.Pattern.Type1, Spinner.Bias.Left);
            spinner.hitBy(player, Spinner.InitialHealth);
            spinner.tick();
            expect(spinner.isActive).to.be.false;
        });

        it('should remain active after hit if health remains above zero', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const spinner = new Spinner(audioPlayer, world, clock, new Point(10, 10), Spinner.Pattern.Type1, Spinner.Bias.Left);
            spinner.hitBy(player, Spinner.InitialHealth / 2);
            player.tick();
            expect(player.isActive).to.be.true;
        });

        it('should add an explosion when it is destroyed', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const spinner = new Spinner(audioPlayer, world, clock, new Point(10, 10), Spinner.Pattern.Type1, Spinner.Bias.Left);
            spinner.hitBy(player, Spinner.InitialHealth);
            spinner.tick();
            expect(world.getActiveExplosions().length).to.be.equal(1);
        });

        it('should increment the score when it is destroyed', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const spinner = new Spinner(audioPlayer, world, clock, new Point(10, 10), Spinner.Pattern.Type1, Spinner.Bias.Left);
            spinner.hitBy(player, Spinner.InitialHealth);
            spinner.tick();
            expect(scoreCounter.currentScore).to.be.above(0);
        });
    });
});
