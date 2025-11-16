import {describe} from 'mocha';
import {expect} from 'chai';

import {Dimensions} from "../../src/Dimensions";
import {Point} from '../../src/Point';
import {ScoreCounter} from "../../src/ScoreCounter";
import {Web} from '../../src/shots/Web';
import {World} from '../../src/World';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ClockStub} from '../stubs/ClockStub';
import {PlayerStub} from "../stubs/PlayerStub";

describe('Web', () => {
    describe('#tick()', () => {
        let audioPlayer: AudioPlayerStub;
        let clock: ClockStub;
        let world: World;

        beforeEach(() => {
            audioPlayer = new AudioPlayerStub();
            clock = new ClockStub();
            world = new World(new Dimensions(480, 640), new ScoreCounter());
        });

        it('should move the web directly downwards', () => {
            const web = new Web(audioPlayer, clock, world, new Point(5, 10));
            web.tick();
            expect(web.coordinates.x).to.be.equal(5);
            expect(web.coordinates.y).to.be.above(10);
        });

        it ('should advance sprite frames over time', () => {
            const web = new Web(audioPlayer, clock, world, new Point(5, 10));
            expect(web.imageDetails.currentFrame).to.be.equal(0);
            web.tick();
            expect(web.imageDetails.currentFrame).to.be.equal(0);
            clock.addSeconds(1);
            web.tick();
            expect(web.imageDetails.currentFrame).to.be.greaterThanOrEqual(1);
            const lastFrame = web.imageDetails.currentFrame;
            clock.addSeconds(1);
            web.tick();
            expect(web.imageDetails.currentFrame).to.be.greaterThanOrEqual(lastFrame);
        });

        it ('should stop advancing frames at the maximum frame', () => {
            const web = new Web(audioPlayer, clock, world, new Point(5, 10));
            expect(web.imageDetails.currentFrame).to.be.equal(0);
            web.tick();
            clock.addSeconds(5);
            web.tick();
            expect(web.imageDetails.currentFrame).to.be.greaterThanOrEqual(1);
            const lastFrame = web.imageDetails.currentFrame;
            clock.addSeconds(1);
            web.tick();
            expect(web.imageDetails.currentFrame).to.be.equal(lastFrame);
        });

        it('should remain active while it remains within the world', () => {
            const web = new Web(audioPlayer, clock, world, new Point(5, 10));
            web.tick();
            expect(web.isActive).to.be.true;
        });

        it('should become inactive when it leaves the world', () => {
            const web = new Web(audioPlayer, clock, world, new Point(5, world.dimensions.height - 1));
            web.tick();
            expect(web.isActive).to.be.false;
        });

        it('should hit an active player within collision distance', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            let hit: boolean = false;
            player.onHit(damage => { hit = true });

            const web = new Web(audioPlayer, clock, world, new Point(10, 10));
            web.tick();
            expect(hit).to.be.true;
        });

        it('should not hit an active player outside collision distance', () => {
            const player = new PlayerStub(world, new Point(100, 100));
            world.addActor(player);

            let hit: boolean = false;
            player.onHit(damage => { hit = true });

            const web = new Web(audioPlayer, clock, world, new Point(10, 10));
            web.tick();
            expect(hit).to.be.false;
        });

        it('should hit the player with damage equal to 1', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const hitFor: number[] = [];
            player.onHit(damage => { hitFor.push(damage) });

            const web = new Web(audioPlayer, clock, world, new Point(10, 10));
            web.tick();
            expect(hitFor).to.be.eql([1]);
        });

        it('should become inactive after it has made a successful hit', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const hitFor: number[] = [];
            player.onHit(damage => { hitFor.push(damage) });

            const web = new Web(audioPlayer, clock, world, new Point(10, 10));
            web.tick();
            expect(web.isActive).to.be.false;
        });

        it('should become inactive if it makes an unsuccessful hit', () => {
            const player = new PlayerStub(world, new Point(10, 10)).ignoreHits();
            world.addActor(player);

            const web = new Web(audioPlayer, clock, world, new Point(10, 10));
            web.tick();
            expect(web.isActive).to.be.false;
        });

        it('should remain active when there is no player', () => {
            const web = new Web(audioPlayer, clock, world, new Point(10, 10));
            web.tick();
            expect(web.isActive).to.be.true;
        });

        it('should play a sound on the first tick', () => {
            const playedSounds: string[] = [];
            audioPlayer.onPlay((soundName: string) => playedSounds.push(soundName));

            const web = new Web(audioPlayer, clock, world, new Point(10, 10));
            web.tick();
            expect(playedSounds.length).to.be.above(0);
        });
    });
});
