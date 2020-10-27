import {describe} from 'mocha';
import {expect} from 'chai';
import {times} from 'underscore';

import {LevelManager} from "../src/LevelManager";
import {LevelState} from "../src/LevelState";
import {Text} from '../src/Text';
import {ClockStub} from "./stubs/ClockStub";
import {LevelStub} from "./stubs/LevelStub";

const AudioPlayerStubBuilder = require('./builders/AudioPlayerStubBuilder');
const WorldStubBuilder = require('./builders/WorldStubBuilder');

describe('LevelManager', () => {
    describe('#ctor()', () => {
        it('starts in an active state', () => {
            let levelManager = new LevelManager({}, {}, new ClockStub(), []);
            expect(levelManager.active).to.be.true;
        });

        it('starts at level one', () => {
            let levelManager = new LevelManager({}, {}, new ClockStub(), []);
            expect(levelManager.currentLevel).to.be.equal(1);
        });
    });

    describe('#on()', () => {
        it('immediately emits a level event', () => {
            let levelUpdate : number | null = null;
            let levelManager = new LevelManager({}, {}, new ClockStub(), []);
            levelManager.on('level', (currentLevel: number) => {
                levelUpdate = currentLevel;
            });
            expect(levelUpdate).to.be.equal(levelManager.currentLevel);
        });
    });

    describe('#tick()', () => {
        it('starts with a delay before level text is displayed', () => {
            let textAdded = false;
            let level1 = new LevelStub().isActive(true);
            let clock = new ClockStub();
            let world = new WorldStubBuilder().build();
            world.addText = (text: Text) => { textAdded = true; };
            let levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1]
            );
            levelManager.tick();
            levelManager.tick();
            expect(textAdded).to.be.false;
        });

        it ('displays level text after an initial delay', () => {
            let textAdded = false;
            let audioPlayer = new AudioPlayerStubBuilder().build();
            let clock = new ClockStub();
            let world = new WorldStubBuilder().build();
            world.addText = (text: Text) => { textAdded = true; };
            let levelManager = new LevelManager(audioPlayer, world, clock, [new LevelStub()]);
            levelManager.tick(); // Tick to schedule text display.
            clock.addSeconds(3);
            levelManager.tick(); // Tick to display text.
            expect(textAdded).to.be.true;
        });

        it('removes level text after a delay', () => {
            let addedText: Text | null = null;
            let audioPlayer = new AudioPlayerStubBuilder().build();
            let clock = new ClockStub();
            let world = new WorldStubBuilder().build();
            world.addText = (text: Text) => { addedText = text; };
            let levelManager = new LevelManager(audioPlayer, world, clock, [new LevelStub()]);
            levelManager.tick(); // Tick to schedule text display.
            clock.addSeconds(3);
            levelManager.tick(); // Tick to display text.
            clock.addSeconds(6);
            levelManager.tick();
            expect(addedText!.active).to.be.false;
            expect((<any>levelManager)._textInterlude).to.be.null;
        });

        it('starts calling tick with the first level after level intro completes', () => {
            let level1Ticked = false;
            let level1 = new LevelStub()
                .isActive(true)
                .onTick(() => { level1Ticked = true });
            let clock = new ClockStub();
            let levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1]
            );
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks first level.
            expect(level1Ticked).to.be.true;
        });

        it ('switches to ticking the next level after each level becomes inactive', () => {
            let level2Ticked = false;
            let level1 = new LevelStub().isActive(false);
            let level2 = new LevelStub()
                .isActive(true)
                .onTick(() => { level2Ticked = true });
            let clock = new ClockStub();
            let levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1, level2]
            );
            // Tick through first level before we get to the second.
            times(2, (n: number) => {
                levelManager.tick(); // Schedules intro.
                clock.addSeconds(100);
                levelManager.tick(); // Clears intro.
                levelManager.tick(); // Ticks new level.
            });

            expect(level2Ticked).to.be.true;
        });

        it('emits a level event when a new level is reached', () => {
            let levelFromEvent: number | null = null;
            let level1 = new LevelStub().isActive(false);
            let level2 = new LevelStub().isActive(true);
            let clock = new ClockStub();
            let levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1, level2]
            );
            levelManager.on('level', (currentLevel: number) => { levelFromEvent = currentLevel });
            // Tick through first level before we get to the second.
            times(2, (n: number) => {
                levelManager.tick(); // Schedules intro.
                clock.addSeconds(100);
                levelManager.tick(); // Clears intro.
                levelManager.tick(); // Ticks new level.
            });
            expect(levelFromEvent).to.be.equal(2);
        });

        it('starts the game win sequence after there are no more levels left', () => {
            let level1 = new LevelStub().isActive(false);
            let clock = new ClockStub();
            let levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1]
            );
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks level.
            expect((<any>levelManager)._state).to.be.equal(LevelState.Win);
        });

        it('removes game win text and becomes inactive when the game win sequence ends', () => {
            let level1 = new LevelStub().isActive(false);
            let clock = new ClockStub();
            let levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1]
            );
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks level and enables game win sequence.
            levelManager.tick(); // Schedules game win sequence.
            clock.addSeconds(100);
            levelManager.tick(); // Ends game win sequence and de-activates.
            expect(levelManager.active).to.be.false;
            expect((<any>levelManager)._textInterlude).to.be.null;
        });

        it('does not emit a next level event when the last level is complete', () => {
            let level1 = new LevelStub().isActive(false);
            let levelUpdate = null;

            let clock = new ClockStub();
            let levelManager = new LevelManager(
                new AudioPlayerStubBuilder().build(),
                new WorldStubBuilder().build(),
                clock,
                [level1]
            );
            levelManager.on('level', (currentLevel: number) => {
                levelUpdate = currentLevel;
            });
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks new level (no more levels).
            expect(levelUpdate).to.be.equal(1);
        });
    });
});