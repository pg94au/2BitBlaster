import {describe} from 'mocha';
import {expect} from 'chai';

import {Bounds} from '../src/Bounds';
import {Clock} from '../src/timing/Clock';
import {Direction} from '../src/devices/Direction';
import {Player} from '../src/Player';
import {Point} from '../src/Point';
import {ScoreCounter} from '../src/ScoreCounter';
import {AudioPlayerStub} from "./stubs/AudioPlayerStub";
import {ClockStub} from "./stubs/ClockStub";
import {JoystickStub} from "./stubs/JoystickStub";
const World = require('../src/World');

describe('Player', () => {
    describe('#ctor()', () => {
        it('should start active', () => {
            let joystick = new JoystickStub();
            let world = new World(480, 640, new ScoreCounter());
            let bounds = new Bounds(1, 2, 1, 2);
            let clock = new ClockStub();
            let audioPlayer = new AudioPlayerStub();
            let player = new Player(joystick, audioPlayer, world, new Point(1, 2), bounds, clock);
            expect(player.isActive()).to.be.true;
        });
    });

    describe('#hitBy()', () => {
        it('will cause visible evidence that damage was sustained when hit is successful', () => {
            let joystick = new JoystickStub();
            let world = new World(480, 640, new ScoreCounter());
            let bounds = new Bounds(1, 2, 1, 2);
            let clock = new ClockStub();
            let audioPlayer = new AudioPlayerStub();
            let player = new Player(joystick, audioPlayer, world, new Point(1, 2), bounds, clock);

            clock.addSeconds(10);   // Add time and tick to get to vulnerable state.
            player.tick();

            player.hitBy({}, 1);

            let imageDetailsAfter = player.getImageDetails();

            expect(imageDetailsAfter.currentFrame).to.be.equal(1);
        });

        it('will only display visible evidence of damage sustained for a short period of time', () => {
            let joystick = new JoystickStub();
            let world = new World(480, 640, new ScoreCounter());
            let bounds = new Bounds(1, 2, 1, 2);
            let clock = new ClockStub();
            let audioPlayer = new AudioPlayerStub();
            let player = new Player(joystick, audioPlayer, world, new Point(1, 2), bounds, clock);

            clock.addSeconds(10);   // Add time and tick to get to vulnerable state.
            player.tick();

            player.hitBy({}, 1);
            let imageDetailsBefore = player.getImageDetails();

            clock.addSeconds(5);
            player.tick();
            let imageDetailsAfter = player.getImageDetails();

            expect(imageDetailsBefore.currentFrame).to.be.not.equal(0);
            expect(imageDetailsAfter.currentFrame).to.be.equal(0);
        });

        it('will play a sound when damage is sustained', () => {
            let joystick = new JoystickStub();
            let world = new World(480, 640, new ScoreCounter());
            let bounds = new Bounds(1, 2, 1, 2);
            let clock = new ClockStub();
            let audioPlayer = new AudioPlayerStub();
            let player = new Player(joystick, audioPlayer, world, new Point(1, 2), bounds, clock);

            let playedSounds: string[] = [];
            audioPlayer.onPlay(soundName => { playedSounds.push(soundName) });

            clock.addSeconds(10);   // Add time and tick to get to vulnerable state.
            player.tick();

            player.hitBy({}, 1);

            expect(playedSounds).to.be.eql(['player_hit']);
        });
    });

    describe('#on()', () => {
        it('immediately emits a health event', () => {
            let healthUpdate: number | null = null;
            let joystick = new JoystickStub();
            let world = new World(480, 640, new ScoreCounter());
            let bounds = new Bounds(1, 2, 1, 2);
            let clock = new ClockStub();
            let audioPlayer = new AudioPlayerStub();

            let player = new Player(joystick, audioPlayer, world, new Point(1, 2), bounds, clock);
            player.on('health', (currentHealth) => {
                healthUpdate = currentHealth;
            });
            expect(healthUpdate).to.be.above(0);
        });
    });

    describe('#tick()', () => {
        it('does not move player when joystick direction is none', () => {
            let joystick = new JoystickStub();
            let audioPlayer = new AudioPlayerStub();
            let world = new World(480, 640, new ScoreCounter());
            let bounds = new Bounds(0, 20, 0, 20);
            let clock = new ClockStub();

            let player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();

            expect(player.getCoordinates()).to.be.eql(new Point(10, 10));
        });

        it('moves player when joystick has direction set', () => {
            let joystick = new JoystickStub().setCurrentDirection(Direction.Right);
            let audioPlayer = new AudioPlayerStub();
            let world = new World(480, 640, new ScoreCounter());
            let bounds = new Bounds(0, 20, 0, 20);
            let clock = new ClockStub();

            let player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();
            expect(player.getCoordinates().x).to.be.above(10);
        });

        [Direction.Up, Direction.Down, Direction.Left, Direction.Right].forEach((direction) => {
            it('will not move player ' + direction + ' out of bounds', () => {
                let joystick = new JoystickStub().setCurrentDirection(direction);
                let audioPlayer = new AudioPlayerStub();
                let world = new World(480, 640, new ScoreCounter());
                let bounds = new Bounds(10, 10, 10, 10);
                let clock = new ClockStub();

                let player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
                player.tick();
                expect(player.getCoordinates()).to.be.eql(new Point(10, 10));
            })
        });

        it('will add a new bullet to world if fire is active', () => {
            let joystick = new JoystickStub().setFireState(true);
            let audioPlayer = new AudioPlayerStub();
            let world = new World(480, 640, new ScoreCounter());
            let bounds = { minX: 0, maxX: 10, minY: 0, maxY: 20 };
            let clock = new ClockStub();

            let addedActor: boolean = false;
            world.addActor = (actor: any) => { addedActor = true; }

            let player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();

            expect(addedActor).is.not.null;
        });

        it('will not allow immediate consecutive bullet to be fired', () => {
            let joystick = new JoystickStub().setFireState(true);
            let audioPlayer = new AudioPlayerStub();
            let addedActors: any[] = [];
            let world = new World(480, 640, new ScoreCounter());
            world.addActor = (actor: any) => { addedActors.push(actor); };
            let bounds = new Bounds(0, 10, 0, 20);
            let clock = new ClockStub();

            let player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();
            player.tick();
            expect(addedActors).is.have.length(1);
        });

        it('will allow another bullet to be fired after a period of time', () => {
            let joystick = new JoystickStub().setFireState(true);
            let audioPlayer = new AudioPlayerStub();
            let addedActors: any[] = [];
            let world = new World(480, 640, new ScoreCounter());
            world.addActor = (actor: any) => { addedActors.push(actor); };
            let bounds = new Bounds(0, 10, 0, 20);
            let clock = new ClockStub();

            let player = new Player(joystick, audioPlayer, world, new Point(10, 10), bounds, clock);
            player.tick();
            clock.addSeconds(1000);
            player.tick();
            expect(addedActors).is.have.length(2);
        });
    });
});
