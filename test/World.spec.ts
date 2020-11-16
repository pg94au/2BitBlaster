import {describe} from 'mocha';
import {expect} from 'chai';

import {AudioPlayer} from "../src/devices/AudioPlayer";
import {Dimensions} from "../src/Dimensions";
import {Explosion} from '../src/Explosion';
import {Point} from '../src/Point';
import {ScoreCounter} from "../src/ScoreCounter";
import {World} from '../src/World';

import {ActorStub} from './stubs/ActorStub';
import {ClockStub} from './stubs/ClockStub';
import {EnemyStub} from './stubs/EnemyStub';
import {AudioPlayerStub} from "./stubs/AudioPlayerStub";
import {ExplosionProperties} from "../src/ExplosionProperties";
import {PlayerStub} from "./stubs/PlayerStub";

describe('World', () => {
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

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        scoreCounter = new ScoreCounter();
        world = new World(new Dimensions(480, 640), scoreCounter);
    });

    describe('#ctor()', () => {
        it('should start with no actors', () => {
            expect(world.getActors()).to.be.empty;
        });
    });

    describe('#addActor()', () => {
        it('should increase the number of actors', () => {
            const actor = new ActorStub(world, new Point(1,1));
            world.addActor(actor);
            expect(world.getActors()).to.have.members([actor]);
        });

        it('should not allow the same actor to be added more than once', () => {
            const actor = new ActorStub(world, new Point(1,1));
            world.addActor(actor);
            expect(() => { world.addActor(actor); }).to.throw('Cannot add same actor twice.');
        });
    });

    describe('#dimensions', () => {
        it('should return the X and Y dimensions of the world in pixels', () => {
            const worldOfSpecificSize = new World(new Dimensions(20, 10), scoreCounter);
            const dimensions = worldOfSpecificSize.dimensions;
            expect(dimensions).to.deep.equal(new Dimensions(20, 10));
        })
    });

    describe('#getActiveEnemies()', () => {
        it('should return empty list when no enemies are present', () => {
            expect(world.getActiveEnemies()).to.be.empty;
        });

        it ('should return only active enemies and skip inactive ones', () => {
            const enemy1 = new EnemyStub(world, new Point(5, 5));
            world.addActor(enemy1);
            const enemy2 = new EnemyStub(world, new Point(5, 5));
            (enemy2 as any)._isActive = false;
            world.addActor(enemy2);
            expect(world.getActiveEnemies()).to.have.length(1);
        });
    });

    describe('#getActiveExplosions()', () => {
        it('should return empty list when no explosions are present', () => {
            expect(world.getActiveExplosions()).to.be.empty;
        });

        it ('should return only active explosions and skip inactive ones', () => {
            const explosionProperties = new ExplosionProperties('image_name', 1, 1, 1, 'sound_name');
            const explosion1 = new Explosion(explosionProperties, audioPlayer, world, new Point(5, 5));
            world.addActor(explosion1);
            const explosion2 = new Explosion(explosionProperties, audioPlayer, world, new Point(5, 5));
            (explosion2 as any)._isActive = false;
            world.addActor(explosion2);
            expect(world.getActiveExplosions()).to.have.length(1);
        });
    });

    describe('#getPlayer()', () => {
        it ('should return null when the player is not present', () => {
            expect(world.getPlayer()).to.be.null;
        });

        it('should return the player if present', () => {
            const player = new PlayerStub(world, new Point(1, 1));
            world.addActor(player);
            expect(world.getPlayer()).to.be.eql(player);
        })
    });

    describe('#getScoreCounter()', () => {
        it('should return the score counter provided to the constructor', () => {
            expect(world.getScoreCounter()).to.be.equal(scoreCounter);
        });
    });

    describe('#tick()', () => {
        it('should call tick on all actors', () => {
            let actor1Ticked: boolean = false;
            const actor1 = new PlayerStub(world,  new Point(1, 1))
                .onTick(() => { actor1Ticked = true });
            let actor2Ticked: boolean = false;
            const actor2 = new EnemyStub(world, new Point(1, 1))
                .onTick(() => { actor2Ticked = true });

            world.addActor(actor1);
            world.addActor(actor2);
            world.tick();

            expect(actor1Ticked).to.be.true;
            expect(actor2Ticked).to.be.true;
        });

        it('should remove any actors that become inactive', () => {
            let actor1Ticked: boolean = false;
            const actor1 = new PlayerStub(world,  new Point(1, 1))
                .onTick(() => { actor1Ticked = true });
            let actor2Ticked: boolean = false;
            const actor2 = new EnemyStub(world, new Point(1, 1))
                .setActiveState(false)
                .onTick(() => { actor2Ticked = true });

            world.addActor(actor1);
            world.addActor(actor2);
            world.tick();

            expect(world.getActors()).to.have.length(1);
            expect(world.getActors()).to.have.members([actor1]);
            expect(world.getActors()).to.not.have.members([actor2]);
        });
    });
});
