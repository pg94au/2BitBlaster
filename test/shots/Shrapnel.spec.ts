import {describe} from 'mocha';
import {expect} from 'chai';

import {Point} from '../../src/Point';
import {Shrapnel} from '../../src/shots/Shrapnel';
import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ScoreCounter} from "../../src/ScoreCounter";
import {PlayerStub} from "../stubs/PlayerStub";
const World = require('../../src/World');

describe('Shrapnel', () => {
    let audioPlayer: any;
    let world: any;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        world = new World(480, 640, new ScoreCounter());
    });

    describe('#tick()', () => {
        it('should move the shrapnel down when specified by the trajectory', () => {
            let shrapnel = new Shrapnel(audioPlayer, world, new Point(5, 10), 270);
            shrapnel.tick();
            expect(shrapnel.getCoordinates().x).to.be.equal(5);
            expect(shrapnel.getCoordinates().y).to.be.above(10);
        });

        it('should move the shrapnel right when specified by the trajectory', () => {
            let shrapnel = new Shrapnel(audioPlayer, world, new Point(5, 10), 0);
            shrapnel.tick();
            expect(shrapnel.getCoordinates().x).to.be.above(5);
            expect(shrapnel.getCoordinates().y).to.be.equal(10);
        });

        it ('should move the shrapnel diagonally left and up when specified by the trajectory', () => {
            let shrapnel = new Shrapnel(audioPlayer, world, new Point(10, 10), 135);
            shrapnel.tick();
            expect(shrapnel.getCoordinates().x).to.be.below(10);
            expect(shrapnel.getCoordinates().y).to.be.below(10);
            expect(shrapnel.getCoordinates().x).to.be.equal(shrapnel.getCoordinates().y);
        });

        it ('should animate the sprite frames', () => {
            let shrapnel = new Shrapnel(audioPlayer, world, new Point(5, 10), 270);
            expect(shrapnel.getImageDetails().currentFrame).to.be.equal(0);
            shrapnel.tick();
            expect(shrapnel.getImageDetails().currentFrame).to.be.equal(1);
        });

        it('should recycle sprite frames when animating', () => {
            let shrapnel = new Shrapnel(audioPlayer, world, new Point(5, 10), 270);
            let numberOfFrames = shrapnel.getImageDetails().numberOfFrames;
            for (let i=0; i < numberOfFrames-1; i++) {
                shrapnel.tick();
            }
            expect(shrapnel.getImageDetails().currentFrame).to.be.equal(numberOfFrames-1);
            shrapnel.tick();
            expect(shrapnel.getImageDetails().currentFrame).to.be.equal(0);
        });

        it('should remain active while it remains within the world', () => {
            let shrapnel = new Shrapnel(audioPlayer, world, new Point(5, 10), 270);
            shrapnel.tick();
            expect(shrapnel.isActive()).to.be.true;
        });

        it('should become inactive when it leaves the world', () => {
            let shrapnel = new Shrapnel(audioPlayer, world, new Point(5, 640), 270);
            shrapnel.tick();
            expect(shrapnel.isActive()).to.be.false;
        });

        it('should hit an active player within collision distance', () => {
            let hitFor: number[] = [];
            let player = new PlayerStub(world, new Point(10, 10))
                .onHit(damage => { hitFor.push(damage) });
            world.addActor(player);

            let shrapnel = new Shrapnel(audioPlayer, world, new Point(10, 10), 270);
            shrapnel.tick();
            expect(hitFor).to.not.be.empty;
        });

        it('should not hit an active player outside collision distance', () => {
            let hitFor: number[] = [];
            let player = new PlayerStub(world, new Point(1000, 1000))
                .onHit(damage => { hitFor.push(damage) });
            world.addActor(player);

            let shrapnel = new Shrapnel(audioPlayer, world, new Point(10, 10), 270);
            shrapnel.tick();
            expect(hitFor).to.be.empty;
        });

        it('should hit the player with damage equal to 1', () => {
            let hitFor: number[] = [];
            let player = new PlayerStub(world, new Point(10, 10))
                .onHit(damage => { hitFor.push(damage) });
            world.addActor(player);

            let shrapnel = new Shrapnel(audioPlayer, world, new Point(10, 10), 270);
            shrapnel.tick();
            expect(hitFor).to.be.eql([1]);
        });

        it('should become inactive after it has made a successful hit', () => {
            let player = new PlayerStub(world, new Point(10, 10))
            world.addActor(player);

            let shrapnel = new Shrapnel(audioPlayer, world, new Point(10, 10), 270);
            shrapnel.tick();
            expect(shrapnel.isActive()).to.be.false;
        });

        it('should become inactive if it makes an unsuccessful hit', () => {
            let player = new PlayerStub(world, new Point(10, 10)).ignoreHits();
            world.addActor(player);

            let shrapnel = new Shrapnel(audioPlayer, world, new Point(10, 10), 270);
            shrapnel.tick();
            expect(shrapnel.isActive()).to.be.false;
        });

        it('should remain active when there is no player', () => {
            let shrapnel = new Shrapnel(audioPlayer, world, new Point(10, 10), 270);
            shrapnel.tick();
            expect(shrapnel.isActive()).to.be.true;
        });

        it('should play a sound on the first tick', () => {
            let playedSounds: string[] = [];
            audioPlayer.onPlay((soundName: string) => { playedSounds.push(soundName) });

            let shrapnel = new Shrapnel(audioPlayer, world, new Point(10, 10), 270);
            shrapnel.tick();
            expect(playedSounds).to.be.eql(['bomb_drop']);
        });
    });
});
