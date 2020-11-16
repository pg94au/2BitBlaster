import {describe} from 'mocha';
import {expect} from 'chai';
import {times} from 'underscore';

import {Dimensions} from "../src/Dimensions";
import {LevelManager} from "../src/LevelManager";
import {LevelState} from "../src/LevelState";
import {ScoreCounter} from "../src/ScoreCounter";
import {Text} from '../src/Text';

import {AudioPlayerStub} from "./stubs/AudioPlayerStub";
import {ClockStub} from "./stubs/ClockStub";
import {LevelStub} from "./stubs/LevelStub";
import {WorldStub} from "./stubs/WorldStub";

describe('LevelManager', () => {
    let audioPlayer: AudioPlayerStub;
    let clock: ClockStub;
    let world:  WorldStub;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        world = new WorldStub(new Dimensions(480, 640), new ScoreCounter());
    });

    describe('#ctor()', () => {
        it('starts in an active state', () => {
            const levelManager = new LevelManager(audioPlayer, world, clock, []);
            expect(levelManager.active).to.be.true;
        });

        it('starts at level one', () => {
            const levelManager = new LevelManager(audioPlayer, world, clock, []);
            expect(levelManager.currentLevel).to.be.equal(1);
        });
    });

    describe('#on()', () => {
        it('immediately emits a level event', () => {
            let levelUpdate : number | null = null;
            const levelManager = new LevelManager(audioPlayer, world, clock, []);
            levelManager.on('level', (currentLevel: number) => {
                levelUpdate = currentLevel;
            });
            expect(levelUpdate).to.be.equal(levelManager.currentLevel);
        });
    });

    describe('#tick()', () => {
        it('starts with a delay before level text is displayed', () => {
            let textAdded = false;
            const level1 = new LevelStub().isActive(true);
            world.addText = (text: Text) => { textAdded = true; };
            const levelManager = new LevelManager(audioPlayer, world, clock, [level1]);
            levelManager.tick();
            levelManager.tick();
            expect(textAdded).to.be.false;
        });

        it ('displays level text after an initial delay', () => {
            let textAdded = false;
            world.addText = (text: Text) => { textAdded = true; };
            const levelManager = new LevelManager(audioPlayer, world, clock, [new LevelStub()]);
            levelManager.tick(); // Tick to schedule text display.
            clock.addSeconds(3);
            levelManager.tick(); // Tick to display text.
            expect(textAdded).to.be.true;
        });

        it('removes level text after a delay', () => {
            let addedText: Text | null = null;
            world.addText = (text: Text) => { addedText = text; };
            const levelManager = new LevelManager(audioPlayer, world, clock, [new LevelStub()]);
            levelManager.tick(); // Tick to schedule text display.
            clock.addSeconds(3);
            levelManager.tick(); // Tick to display text.
            clock.addSeconds(6);
            levelManager.tick();
            expect(addedText!.active).to.be.false;
            expect((levelManager as any)._textInterlude).to.be.null;
        });

        it('starts calling tick with the first level after level intro completes', () => {
            let level1Ticked = false;
            const level1 = new LevelStub()
                .isActive(true)
                .onTick(() => { level1Ticked = true });
            const levelManager = new LevelManager(audioPlayer, world, clock, [level1]);
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks first level.
            expect(level1Ticked).to.be.true;
        });

        it ('switches to ticking the next level after each level becomes inactive', () => {
            let level2Ticked = false;
            const level1 = new LevelStub().isActive(false);
            const level2 = new LevelStub()
                .isActive(true)
                .onTick(() => { level2Ticked = true });
            const levelManager = new LevelManager(audioPlayer, world, clock, [level1, level2]);
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
            const level1 = new LevelStub().isActive(false);
            const level2 = new LevelStub().isActive(true);
            const levelManager = new LevelManager(audioPlayer, world, clock, [level1, level2]);
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
            const level1 = new LevelStub().isActive(false);
            const levelManager = new LevelManager(audioPlayer, world, clock, [level1]);
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks level.
            expect((levelManager as any)._state).to.be.equal(LevelState.Win);
        });

        it('removes game win text and becomes inactive when the game win sequence ends', () => {
            const level1 = new LevelStub().isActive(false);
            const levelManager = new LevelManager(audioPlayer, world, clock, [level1]);
            levelManager.tick(); // Schedules intro.
            clock.addSeconds(100);
            levelManager.tick(); // Clears intro.
            levelManager.tick(); // Ticks level and enables game win sequence.
            levelManager.tick(); // Schedules game win sequence.
            clock.addSeconds(100);
            levelManager.tick(); // Ends game win sequence and de-activates.
            expect(levelManager.active).to.be.false;
            expect((levelManager as any)._textInterlude).to.be.null;
        });

        it('does not emit a next level event when the last level is complete', () => {
            const level1 = new LevelStub().isActive(false);
            let levelUpdate = null;

            const levelManager = new LevelManager(audioPlayer, world, clock, [level1]);
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