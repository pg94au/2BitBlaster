import {describe} from 'mocha';
import {expect} from 'chai';

import {Game} from '../src/Game';
import {World} from "../src/World";

import {AudioPlayerStub} from "./stubs/AudioPlayerStub";
import {ClockStub} from "./stubs/ClockStub";
import {JoystickStub} from "./stubs/JoystickStub";
import {RendererStub} from "./stubs/RendererStub";
import {ShotStub} from "./stubs/ShotStub";

describe('Game', () => {
    let audioPlayer: AudioPlayerStub;
    let clock: ClockStub;
    let joystick: JoystickStub;
    let renderer: RendererStub;

    beforeEach(() => {
        audioPlayer = new AudioPlayerStub();
        clock = new ClockStub();
        joystick = new JoystickStub();
        renderer = new RendererStub();
    });

    // Prevent the animation loop from running when the game is started.
    global.requestAnimationFrame = (callback) => { return 0 };

    describe('#start()', () => {
        it('should begin game with score of zero', () => {
            let initialScore: number | null = null;
            const game = new Game(joystick, renderer, audioPlayer, clock);
            game.on('score', currentScore => { initialScore = currentScore });
            game.start();
            expect(initialScore).to.be.equal(0);
        });

        it('should indicate a positive initial number of remaining lives', () => {
            let initialRemainingLives: number | null = null;
            const game = new Game(joystick, renderer, audioPlayer, clock);
            game.on('remainingLives', remainingLives => { initialRemainingLives = remainingLives });
            game.start();
            expect(initialRemainingLives).to.be.greaterThan(0);
        });
    });

    describe('#ticker()', () => {
        it('should decrement the number of remaining lives when the player is killed', () => {
            let initialRemainingLives: number | null = null;
            let currentRemainingLives: number | null = null;

            const game = new Game(joystick, renderer, audioPlayer, clock);
            game.on('remainingLives', remainingLives => { currentRemainingLives = remainingLives });

            game.start();
            initialRemainingLives = currentRemainingLives;

            clock.addSeconds(1000);
            (game as any).ticker(); // Tick adds player to world.
            clock.addSeconds(1000);
            (game as any).ticker(); // Tick ensures player is now vulnerable.

            const world = ((game as any)._world as World);
            const player = world.getPlayer()!;
            const shot = new ShotStub(world, player.getCoordinates());
            player.hitBy(shot, 1000);
            (game as any).ticker(); // Tick removes the player from the world.
            (game as any).ticker(); // Tick notices the player gone and decrements lives remaining.

            expect(currentRemainingLives).to.be.below(initialRemainingLives!);
        });
    });
});
