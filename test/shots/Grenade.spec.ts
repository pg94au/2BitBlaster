import {describe} from 'mocha';
import {expect} from 'chai';

import {Grenade} from '../../src/shots/Grenade';
import {Point} from '../../src/Point';
import {Shrapnel} from '../../src/shots/Shrapnel';
import {World} from '../../src/World';

import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ScoreCounter} from "../../src/ScoreCounter";
import {PlayerStub} from "../stubs/PlayerStub";

describe('Grenade', () => {
    describe('#tick()', () => {
        let audioPlayer: any;
        let world: World;

        beforeEach(() => {
            audioPlayer = new AudioPlayerStub();
            world = new World(480, 640, new ScoreCounter());
        });

        it('should move the grenade directly downwards', () => {
            let grenade = new Grenade(audioPlayer, world, new Point(5, 10));
            grenade.tick();
            expect(grenade.getCoordinates().x).to.be.equal(5);
            expect(grenade.getCoordinates().y).to.be.above(10);
        });

        it ('should animate the sprite frames', () => {
            let grenade = new Grenade(audioPlayer, world, new Point(5, 10));
            expect(grenade.getImageDetails().currentFrame).to.be.equal(0);
            grenade.tick();
            expect(grenade.getImageDetails().currentFrame).to.be.equal(1);
        });

        it('should remain active before moving a distance of 200', () => {
            let grenade = new Grenade(audioPlayer, world, new Point(5, 10));
            grenade.tick();
            expect(grenade.isActive()).to.be.true;
        });

        it('should become inactive after it has moved more than a distance of 200', () => {
            let grenade = new Grenade(audioPlayer, world, new Point(5, 10));
            while (grenade.getCoordinates().y < 210) {
                grenade.tick();
            }

            expect(grenade.isActive()).to.be.false;
        });

        it('should add pieces of shrapnel when it explodes', () => {
            let grenade = new Grenade(audioPlayer, world, new Point(5, 10));
            while (grenade.getCoordinates().y < 210) {
                grenade.tick();
            }

            let shrapnel = world.getActors().filter((a: any) => { return (a instanceof Shrapnel) });

            expect(shrapnel.length).to.be.above(0);
        });

        it('should become inactive if it leaves the world', () => {
            let grenade = new Grenade(audioPlayer, world, new Point(5, world.getDimensions().height));
            grenade.tick();
            expect(grenade.isActive()).to.be.false;
        });

        it('should hit an active player within collision distance', () => {
            let hitFor: number[] = [];
            let player = new PlayerStub(world, new Point(10, 10))
                .onHit(damage => hitFor.push(damage));
            world.addActor(player);

            let grenade = new Grenade(audioPlayer, world, new Point(10, 10));
            grenade.tick();
            expect(hitFor).to.not.be.empty;
        });

        it('should not hit an active player outside collision distance', () => {
            let hitFor: number[] = [];
            let player = new PlayerStub(world, new Point(100, 100))
                .onHit(damage => hitFor.push(damage));
            world.addActor(player);

            let grenade = new Grenade(audioPlayer, world, new Point(10, 10));
            grenade.tick();
            expect(hitFor).to.be.empty;
        });

        it('should hit the player with damage equal to 3', () => {
            let hitFor: number[] = [];
            let player = new PlayerStub(world, new Point(10, 10))
                .onHit(damage => hitFor.push(damage));
            world.addActor(player);

            let grenade = new Grenade(audioPlayer, world, new Point(10, 10));
            grenade.tick();
            expect(hitFor).to.be.eql([3]);
        });

        it('should become inactive after it has made a successful hit', () => {
            let player = new PlayerStub(world, new Point(10, 10));
            world.addActor(player);

            let grenade = new Grenade(audioPlayer, world, new Point(10, 10));
            grenade.tick();
            expect(grenade.isActive()).to.be.false;
        });

        it('should become inactive if it makes an unsuccessful hit', () => {
            let player = new PlayerStub(world, new Point(10, 10)).ignoreHits();
            world.addActor(player);

            let grenade = new Grenade(audioPlayer, world, new Point(10, 10));
            grenade.tick();
            expect(grenade.isActive()).to.be.false;
        });

        it('should remain active when there is no player', () => {
            let grenade = new Grenade(audioPlayer, world, new Point(10, 10));
            grenade.tick();
            expect(grenade.isActive()).to.be.true;
        });

        it('should play a sound on the first tick', () => {
            let playedSound: boolean = false;
            audioPlayer.onPlay((soundName: string) => { playedSound = true });

            let grenade = new Grenade(audioPlayer, world, new Point(10, 10));
            grenade.tick();
            expect(playedSound).to.be.true;
        });
    });
});
