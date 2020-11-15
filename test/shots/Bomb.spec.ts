import {describe} from 'mocha';
import {expect} from 'chai';

import {Bomb} from '../../src/shots/Bomb';
import {Point} from '../../src/Point';
import {ScoreCounter} from "../../src/ScoreCounter";
import {World} from '../../src/World';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {PlayerStub} from "../stubs/PlayerStub";

describe('Bomb', () => {
    describe('#tick()', () => {
        let audioPlayer: AudioPlayerStub;
        let world: World;

        beforeEach(() => {
            audioPlayer = new AudioPlayerStub();
            world = new World(480, 640, new ScoreCounter());
        });

        it('should move the bomb directly downwards', () => {
            const bomb = new Bomb(audioPlayer, world, new Point(5, 10));
            bomb.tick();
            expect(bomb.getCoordinates().x).to.be.equal(5);
            expect(bomb.getCoordinates().y).to.be.above(10);
        });

        it ('should animate the sprite frames', () => {
            const bomb = new Bomb(audioPlayer, world, new Point(5, 10));
            expect(bomb.getImageDetails().currentFrame).to.be.equal(0);
            bomb.tick();
            expect(bomb.getImageDetails().currentFrame).to.be.equal(1);
        });

        it('should recycle sprite frames when animating', () => {
            const bomb = new Bomb(audioPlayer, world, new Point(5, 10));
            const numberOfFrames = bomb.getImageDetails().numberOfFrames;
            for (let i=0; i < numberOfFrames-1; i++) {
                bomb.tick();
            }
            expect(bomb.getImageDetails().currentFrame).to.be.equal(numberOfFrames-1);
            bomb.tick();
            expect(bomb.getImageDetails().currentFrame).to.be.equal(0);
        });

        it('should remain active while it remains within the world', () => {
            const bomb = new Bomb(audioPlayer, world, new Point(5, 10));
            bomb.tick();
            expect(bomb.isActive()).to.be.true;
        });

        it('should become inactive when it leaves the world', () => {
            const bomb = new Bomb(audioPlayer, world, new Point(5, world.getDimensions().height - 1));
            bomb.tick();
            expect(bomb.isActive()).to.be.false;
        });

        it('should hit an active player within collision distance', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            let hit: boolean = false;
            player.onHit(damage => { hit = true });

            const bomb = new Bomb(audioPlayer, world, new Point(10, 10));
            bomb.tick();
            expect(hit).to.be.true;
        });

        it('should not hit an active player outside collision distance', () => {
            const player = new PlayerStub(world, new Point(100, 100));
            world.addActor(player);

            let hit: boolean = false;
            player.onHit(damage => { hit = true });

            const bomb = new Bomb(audioPlayer, world, new Point(10, 10));
            bomb.tick();
            expect(hit).to.be.false;
        });

        it('should hit the player with damage equal to 1', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const hitFor: number[] = [];
            player.onHit(damage => { hitFor.push(damage) });

            const bomb = new Bomb(audioPlayer, world, new Point(10, 10));
            bomb.tick();
            expect(hitFor).to.be.eql([1]);
        });

        it('should become inactive after it has made a successful hit', () => {
            const player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            const hitFor: number[] = [];
            player.onHit(damage => { hitFor.push(damage) });

            const bomb = new Bomb(audioPlayer, world, new Point(10, 10));
            bomb.tick();
            expect(bomb.isActive()).to.be.false;
        });

        it('should become inactive if it makes an unsuccessful hit', () => {
            const player = new PlayerStub(world, new Point(10, 10)).ignoreHits();
            world.addActor(player);

            const bomb = new Bomb(audioPlayer, world, new Point(10, 10));
            bomb.tick();
            expect(bomb.isActive()).to.be.false;
        });

        it('should remain active when there is no player', () => {
            const bomb = new Bomb(audioPlayer, world, new Point(10, 10));
            bomb.tick();
            expect(bomb.isActive()).to.be.true;
        });

        it('should play a sound on the first tick', () => {
            const playedSounds: string[] = [];
            audioPlayer.onPlay((soundName: string) => playedSounds.push(soundName));

            const bomb = new Bomb(audioPlayer, world, new Point(10, 10));
            bomb.tick();
            expect(playedSounds.length).to.be.above(0);
        });
    });
});
