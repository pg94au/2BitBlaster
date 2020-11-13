import {describe} from 'mocha';
import {expect} from 'chai';

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
    let audioPlayer: any;
    let clock: ClockStub;
    let scoreCounter: ScoreCounter;
    let world: World;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        scoreCounter = new ScoreCounter();
        world = new World(480, 640, scoreCounter);
    });

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        scoreCounter = new ScoreCounter();
        world = new World(480, 640, scoreCounter);
    });

    describe('#ctor()', () => {
        it('should start with no actors', () => {
            let world = new World(100, 200, scoreCounter);
            expect(world.getActors()).to.be.empty;
        });
    });

    describe('#addActor()', () => {
        it('should increase the number of actors', () => {
            let world = new World(100, 200, scoreCounter);
            let initialNumberOfActors = world.getActors().length;
            let actor = new ActorStub(world, new Point(1,1));
            world.addActor(actor);
            expect(world.getActors()).to.have.members([actor]);
        });

        it('should not allow the same actor to be added more than once', () => {
            let world = new World(100, 200, scoreCounter);
            let actor = new ActorStub(world, new Point(1,1));
            world.addActor(actor);
            expect(function() { world.addActor(actor); }).to.throw('Cannot add same actor twice.');
        });
    });

    describe('#getDimensions()', () => {
        it('should return the X and Y dimensions of the world in pixels', () => {
            let world = new World(20, 10, scoreCounter);
            let dimensions = world.getDimensions();
            expect(dimensions).to.deep.equal(new Dimensions(20, 10));
        })
    });

    describe('#getActiveEnemies()', () => {
        it('should return empty list when no enemies are present', () => {
            let world = new World(20, 10, scoreCounter);
            expect(world.getActiveEnemies()).to.be.empty;
        });

        it ('should return only active enemies and skip inactive ones', () => {
            let world = new World(20, 10, scoreCounter);
            let enemy1 = new EnemyStub(world, new Point(5, 5));
            world.addActor(enemy1);
            let enemy2 = new EnemyStub(world, new Point(5, 5));
            enemy2.isActive = function() { return false };
            world.addActor(enemy2);
            expect(world.getActiveEnemies()).to.have.length(1);
        });
    });

    describe('#getActiveExplosions()', () => {
        it('should return empty list when no explosions are present', () => {
            let world = new World(20, 10, scoreCounter);
            expect(world.getActiveExplosions()).to.be.empty;
        });

        it ('should return only active explosions and skip inactive ones', () => {
            let world = new World(20, 10, scoreCounter);

            let explosionProperties = new ExplosionProperties('image_name', 1, 1, 1, 'sound_name');
            let explosion1 = new Explosion(explosionProperties, audioPlayer, world, new Point(5, 5));
            world.addActor(explosion1);
            let explosion2 = new Explosion(explosionProperties, audioPlayer, world, new Point(5, 5));
            explosion2.isActive = function() { return false };
            world.addActor(explosion2);
            expect(world.getActiveExplosions()).to.have.length(1);
        });
    });

    describe('#getPlayer()', () => {
        it ('should return null when the player is not present', () => {
            let world = new World(20, 10, scoreCounter);
            expect(world.getPlayer()).to.be.null;
        });

        it('should return the player if present', function() {
            let player = new PlayerStub(world, new Point(1, 1));
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
            let actor1 = new PlayerStub(world,  new Point(1, 1))
                .onTick(() => { actor1Ticked = true });
            let actor2Ticked: boolean = false;
            let actor2 = new EnemyStub(world, new Point(1, 1))
                .onTick(() => { actor2Ticked = true });

            world.addActor(actor1);
            world.addActor(actor2);
            world.tick();

            expect(actor1Ticked).to.be.true;
            expect(actor2Ticked).to.be.true;
        });

        it('should remove any actors that become inactive', () => {
            let world = new World(20, 20, scoreCounter);
            let actor1Ticked: boolean = false;
            let actor1 = new PlayerStub(world,  new Point(1, 1))
                .onTick(() => { actor1Ticked = true });
            let actor2Ticked: boolean = false;
            let actor2 = new EnemyStub(world, new Point(1, 1))
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
