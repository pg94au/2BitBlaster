import {describe} from 'mocha';
import {expect} from 'chai';

import {Bullet} from '../../src/shots/Bullet';
import {Point} from '../../src/Point';
import {AudioPlayerStub} from "../stubs/AudioPlayerStub";
import {ScoreCounter} from "../../src/ScoreCounter";
import {EnemyStub} from "../stubs/EnemyStub";
import {Bounds} from "../../src/Bounds";
import {World} from '../../src/World';

describe('Bullet', () => {
    describe('#tick()', () => {
        let audioPlayer: AudioPlayerStub;
        let world: any;

        beforeEach(() => {
            audioPlayer = new AudioPlayerStub();
            world = new World(480, 640, new ScoreCounter());
        });

        it('should move the bullet directly upwards', () => {
            let bullet = new Bullet(
                audioPlayer,
                world,
                new Point(5, 10)
            );
            bullet.tick();
            expect(bullet.getCoordinates().x).to.be.equal(5);
            expect(bullet.getCoordinates().y).to.be.below(10);
        });

        it ('should animate the sprite frames', () => {
            let bullet = new Bullet(
                audioPlayer,
                world,
                new Point(5, 10)
            );
            expect(bullet.getImageDetails().currentFrame).to.be.equal(0);
            bullet.tick();
            expect(bullet.getImageDetails().currentFrame).to.be.equal(1);
        });

        it('should recycle sprite frames when animating', () => {
            let bullet = new Bullet(
                audioPlayer,
                world,
                new Point(5, 10)
            );
            let numberOfFrames = bullet.getImageDetails().numberOfFrames;
            for (let i=0; i < numberOfFrames-1; i++) {
                bullet.tick();
            }
            expect(bullet.getImageDetails().currentFrame).to.be.equal(numberOfFrames-1);
            bullet.tick();
            expect(bullet.getImageDetails().currentFrame).to.be.equal(0);
        });

        it('should remain active while it remains within the world', () => {
            var bullet = new Bullet(
                audioPlayer,
                world,
                new Point(5, 10)
            );
            bullet.tick();
            expect(bullet.isActive()).to.be.true;
        });

        it('should become inactive when it leaves the world', () => {
            var bullet = new Bullet(
                audioPlayer,
                world,
                new Point(5, 0)
            );
            bullet.tick();
            expect(bullet.isActive()).to.be.false;
        });

        it('should hit any active enemies within collision distance', () => {
            let hit: boolean = false;
            let enemy = new EnemyStub(world, new Point(10, 10)).onHit(damage => hit = true);
            world.addActor(enemy);
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            bullet.tick();
            expect(hit).to.be.true;
        });

        it('should not hit any active enemies outside collision distance', () => {
            let hit: boolean = false;
            let enemy = new EnemyStub(world, new Point(100, 100))
                .onHit(damage => hit = true)
                .setCollisionMask([new Bounds(-5, 5, -5, 5)]);
            world.addActor(enemy);
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            bullet.tick();
            expect(hit).to.be.false;
        });

        it('should hit a target with damage equal to 1', () => {
            let actualDamage: number = 0;
            let enemy = new EnemyStub(world, new Point(10, 10)).onHit(damage => actualDamage = damage);
            world.addActor(enemy);
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            bullet.tick();
            expect(actualDamage).to.be.equal(1);
        });

        it('should become inactive after it has made a successful hit', () => {
            let enemy = new EnemyStub(world, new Point(10, 10));
            world.addActor(enemy);
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            bullet.tick();
            expect(bullet.isActive()).to.be.false;
        });

        it('should become inactive if it makes an unsuccessful hit', () => {
            let enemy = new EnemyStub(world, new Point(10, 10)).refuseHits();
            world.addActor(enemy);
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            bullet.tick();
            expect(bullet.isActive()).to.be.false;
        });

        it('should only be able to hit a single target', () => {
            let enemy1Hit = false;
            let enemy2Hit = false;
            let enemy1 = new EnemyStub(world, new Point(10, 10)).onHit(damage => enemy1Hit = true);
            world.addActor(enemy1);
            let enemy2 = new EnemyStub(world, new Point(10, 10)).onHit(damage => enemy2Hit = true);
            world.addActor(enemy2);
            let bullet = new Bullet(audioPlayer, world, new Point(10, 10));
            bullet.tick();
            expect(enemy1Hit).to.not.be.equal(enemy2Hit);
        });

        it('should play a sound on the first tick', () => {
            let playedSound: boolean = false;
            audioPlayer.onPlay((soundName: string) => playedSound = true);

            let bullet = new Bullet(audioPlayer, world, new Point(5, 10));
            bullet.tick();

            expect(playedSound).to.be.true;
        });
    });
});
