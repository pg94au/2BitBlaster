import {describe} from 'mocha';
import {expect} from 'chai';

import {Actor} from "../src/Actor";
import {Bounds} from '../src/Bounds';
import {Direction} from '../src/devices/Direction';
import {Player} from '../src/Player';
import {Point} from '../src/Point';
import {ScoreCounter} from '../src/ScoreCounter';
import {World} from '../src/World';

import {AudioPlayerStub} from "./stubs/AudioPlayerStub";
import {ClockStub} from "./stubs/ClockStub";
import {JoystickStub} from "./stubs/JoystickStub";
import {ShotStub} from "./stubs/ShotStub";

describe('Player', () => {
    let audioPlayer: AudioPlayerStub;
    let clock: ClockStub;
    let joystick: JoystickStub;
    let world:  World;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        joystick = new JoystickStub();
        world = new World(480, 640, new ScoreCounter());
    });

    describe('#ctor()', () => {
        it('should start active', () => {
            const bounds = new Bounds(1, 2, 1, 2);
            const player = new Player(joystick, audioPlayer, world, new Point(1, 2), bounds, clock);
            expect(player.isActive).to.be.true;
        });
    });

    describe('#hitBy()', () => {
        it('will cause visible evidence that damage was sustained when hit is successful', () => {
            const bounds = new Bounds(1, 2, 1, 2);
            const player = new Player(joystick, audioPlayer, world, new Point(1, 2), bounds, clock);

            clock.addSeconds(10);   // Add time and tick to get to vulnerable state.
            player.tick();

            const shot = new ShotStub(world, new Point(1, 2));
            world.addActor(shot);

            player.hitBy(shot, 1);

            const imageDetailsAfter = player.imageDetails;

            expect(imageDetailsAfter.currentFrame).to.be.equal(1);
        });

        it('will only display visible evidence of damage sustained for a short period of time', () => {
            const bounds = new Bounds(1, 2, 1, 2);
            const player = new Player(joystick, audioPlayer, world, new Point(1, 2), bounds, clock);

            clock.addSeconds(10);   // Add time and tick to get to vulnerable state.
            player.tick();

            const shot = new ShotStub(world, new Point(1, 2));
            world.addActor(shot);

            player.hitBy(shot, 1);
            const imageDetailsBefore = player.imageDetails;

            clock.addSeconds(5);
            player.tick();
            const imageDetailsAfter = player.imageDetails;

            expect(imageDetailsBefore.currentFrame).to.be.not.equal(0);
            expect(imageDetailsAfter.currentFrame).to.be.equal(0);
        });

        it('will play a sound when damage is sustained', () => {
            const bounds = new Bounds(1, 2, 1, 2);
            const player = new Player(joystick, audioPlayer, world, new Point(1, 2), bounds, clock);

            const playedSounds: string[] = [];
            audioPlayer.onPlay(soundName => { playedSounds.push(soundName) });

            clock.addSeconds(10);   // Add time and tick to get to vulnerable state.
            player.tick();

            const shot = new ShotStub(world, new Point(1, 2));
            world.addActor(shot);

            player.hitBy(shot, 1);

            expect(playedSounds).to.be.eql(['player_hit']);
        });
    });

    describe('#on()', () => {
        it('immediately emits a health event', () => {
            let healthUpdate: number | null = null;
            const bounds = new Bounds(1, 2, 1, 2);

            const player = new Player(joystick, audioPlayer, world, new Point(1, 2), bounds, clock);
            player.on('health', (currentHealth) => {
                healthUpdate = currentHealth;
            });
            expect(healthUpdate).to.be.above(0);
        });
    });

    describe('#tick()', () => {
        it('does not move player when joystick direction is none', () => {
            const bounds = new Bounds(0, 20, 0, 20);

            const player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();

            expect(player.coordinates).to.be.eql(new Point(10, 10));
        });

        it('moves player when joystick has direction set', () => {
            joystick.setCurrentDirection(Direction.Right);
            const bounds = new Bounds(0, 20, 0, 20);

            const player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();
            expect(player.coordinates.x).to.be.above(10);
        });

        [Direction.Up, Direction.Down, Direction.Left, Direction.Right].forEach((direction) => {
            it('will not move player ' + direction + ' out of bounds', () => {
                joystick.setCurrentDirection(direction);
                const bounds = new Bounds(10, 10, 10, 10);

                const player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
                player.tick();
                expect(player.coordinates).to.be.eql(new Point(10, 10));
            })
        });

        it('will add a new bullet to world if fire is active', () => {
            joystick.setFireState(true);
            const bounds = new Bounds(0, 10, 0, 20);

            let addedActor: boolean = false;
            world.addActor = (actor: Actor) => { addedActor = true; }

            const player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();

            expect(addedActor).is.not.null;
        });

        it('will not allow immediate consecutive bullet to be fired', () => {
            joystick.setFireState(true);
            const addedActors: Actor[] = [];
            world.addActor = (actor: Actor) => { addedActors.push(actor); };
            const bounds = new Bounds(0, 10, 0, 20);

            const player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();
            player.tick();
            expect(addedActors).is.have.length(1);
        });

        it('will allow another bullet to be fired after a period of time', () => {
            joystick.setFireState(true);
            const addedActors: Actor[] = [];
            world.addActor = (actor: Actor) => { addedActors.push(actor); };
            const bounds = new Bounds(0, 10, 0, 20);

            const player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();
            clock.addSeconds(1000);
            player.tick();
            expect(addedActors).is.have.length(2);
        });
    });
});
