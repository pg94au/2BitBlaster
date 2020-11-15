import Debug from "debug";
const debug = Debug("Blaster:Game");
import {EventEmitter} from "events";

import {AudioPlayer} from "./devices/AudioPlayer";
import {Bounds} from './Bounds';
import {Clock} from "./timing/Clock";
import {Joystick} from "./devices/Joystick";
import {Level} from './Level';
import {LevelManager} from './LevelManager';
import {Player} from './Player';
import {Point} from './Point';
import {Renderer} from "./devices/Renderer";
import {Scheduler} from './timing/Scheduler';
import {ScoreCounter} from './ScoreCounter';
import {SecondWave} from './waves/SecondWave';
import {SimpleWave} from './waves/SimpleWave';
import {SpinnerWave} from './waves/SpinnerWave';
import {SpinnerWave2} from './waves/SpinnerWave2';
import {SplitterWave} from './waves/SplitterWave';
import {StarField} from './StarField';
import {TextInterlude} from './TextInterlude';
import {World} from './World';

export class Game {
    private readonly _joystick: Joystick;
    private readonly _renderer: Renderer;
    private readonly _audioPlayer: AudioPlayer;
    private readonly _clock: Clock;
    private readonly _scheduler: Scheduler;
    private readonly _eventEmitter: EventEmitter;
    private _world!: World;
    private _starField!: StarField;
    private _levelManager!: LevelManager;
    private _remainingLives!: number;
    private _player!: Player;
    private _scoreCounter!: ScoreCounter;
    private _textInterlude!: TextInterlude | null;
    private _isActive: boolean = false;

    constructor(joystick: Joystick, renderer: Renderer, audioPlayer: AudioPlayer, clock: Clock) {
        debug('Game constructor');
        this._joystick = joystick;
        this._renderer = renderer;
        this._audioPlayer = audioPlayer;
        this._clock = clock;
        this._scheduler = new Scheduler(clock);
        this._eventEmitter = new EventEmitter();
    }

    createDisplay(): void {
        this._renderer.initialize(this._world);
    }

    ticker(): void {
        if (this.gameIsOver()) {
            debug('Game.ticker: The game is over.');
            this.tickWithinGameOver();
        }

        if ((this._world.getPlayer() === null) && (this._remainingLives >= 0)) {
            if (this._scheduler.scheduleOperation(
                'resurrectPlayer',
                3000,
                () => {
                    if (this._remainingLives >= 0) {
                        this.addPlayerToWorld();
                    }
                })
            ) {
                this._remainingLives--;
                if (this._remainingLives >= 0) {
                    this._eventEmitter.emit('remainingLives', this._remainingLives);
                }
            }
        }

        this._scheduler.executeDueOperations();

        if (this._isActive) {
            setTimeout(() => {
                global.requestAnimationFrame(() => { this.ticker() });
            }, 1000/30);
        }
        else {
            debug('ticker: Ticker stopping because game is over.');
        }

        this._starField.tick();
        this._levelManager.tick();
        this._world.tick();

        this._renderer.render();

        debug('Current joystick direction is %s', this._joystick.getCurrentDirection().toString());
    }

    gameIsOver(): boolean {
        if (!this._levelManager.active) {
            debug('Final level has been completed.');
            return true;
        }
        if (this._remainingLives === -1) {
            return true;
        }

        return false;
    }

    addPlayerToWorld(): void {
        const playerBounds = new Bounds(50, 430, 490, 590);
        const playerStartingPoint = new Point(
            (playerBounds.left + playerBounds.right) / 2,
            (playerBounds.top + playerBounds.bottom) / 2
        );
        this._player = new Player(
            this._joystick,
            this._audioPlayer,
            this._world,
            playerStartingPoint,
            playerBounds,
            this._clock
        );
        this._player.on('health', currentHealth => {
            this._eventEmitter.emit('health', currentHealth);
        });
        this._world.addActor(this._player);
    }

    on(e: string, f: (...args: any[]) => void): void {
        this._eventEmitter.on(e, f);
    }

    start(): void {
        debug('Game:start');
        this._scheduler.scheduleOperation(
            'resurrectPlayer',
            1000,
            () => { this.addPlayerToWorld() }
        );

        this._isActive = true;
        this._remainingLives = 2;
        this._eventEmitter.emit('remainingLives', this._remainingLives);

        this._scoreCounter = new ScoreCounter();
        this._scoreCounter.on('score', currentScore => {
            this._eventEmitter.emit('score', currentScore);
        });
        this._scoreCounter.on('highScore', highScore => {
            this._eventEmitter.emit('highScore', highScore);
        });

        this._world = new World(480, 640, this._scoreCounter);

        this._starField = new StarField(this._world, this._clock);

        this._levelManager = new LevelManager(
            this._audioPlayer,
            this._world,
            this._clock,
            [
                new Level([
                    new SpinnerWave(this._audioPlayer, this._world, this._clock),
                    new SimpleWave(this._audioPlayer, this._world, this._clock)
                ]),
                new Level([
                    new SpinnerWave2(this._audioPlayer, this._world, this._clock),
                    new SecondWave(this._audioPlayer, this._world, this._clock)
                ]),
                new Level([
                    new SimpleWave(this._audioPlayer, this._world, this._clock),
                    new SecondWave(this._audioPlayer, this._world, this._clock),
                    new SplitterWave(this._audioPlayer, this._world, this._clock)
                ])
            ]
        );
        this._levelManager.on('level', currentLevel => {
            this._eventEmitter.emit('level', currentLevel);
        });

        this.createDisplay();
        this.ticker();
    }

    tickWithinGameOver(): void {
        // When the game ends, text is displayed for some time before it stops
        // and the gameOver event is emitted.  This gives the user a chance to see the final
        // explosion, and few moments of the world without any player.
        if (this._textInterlude == null) {
            this._textInterlude = new TextInterlude(
                this._world, this._clock,
                "GAME OVER",
                "Arial", 50, "red",
                this._world.getDimensions().width / 2, this._world.getDimensions().height / 2,
                2000, 4000, 2000
            );
        }

        this._textInterlude.tick();
        if (!this._textInterlude.active) {
            debug('Game.ticker: Emitting gameOver event.');
            this._textInterlude = null;
            this._isActive = false;
            this._eventEmitter.emit('gameOver');
            this._scoreCounter.synchronizeHighScore();
        }
    }
}
