import Debug from "debug";
const debug = Debug("Blaster:SpinnerWave2");

import {AudioPlayer} from "../devices/AudioPlayer";
import {Clock} from "../timing/Clock";
import {Point} from '../Point';
import {Scheduler} from '../timing/Scheduler';
import {Spinner} from '../enemies/Spinner';
import {Wave} from './Wave';
import {World} from "../World";

export class SpinnerWave2 implements Wave {
    private readonly _audioPlayer: AudioPlayer;
    private readonly _world: World;
    private readonly _clock: Clock;
    private readonly _scheduler: Scheduler;
    private _numberOfSpinnersLeftToDeploy: number = 10;

    constructor(audioPlayer: AudioPlayer, world: World, clock: Clock) {
        debug('SpinnerWave2 constructor');

        this._audioPlayer = audioPlayer;
        this._world = world;
        this._clock = clock;
        this._scheduler = new Scheduler(clock);
    }

    get isActive(): boolean {
        return (this._numberOfSpinnersLeftToDeploy > 0)
            || (this._world.activeEnemies.length > 0)
            || (this._world.activeExplosions.length > 0);
    }

    tick(): void {
        debug('SpinnerWave2.tick');

        if (this._numberOfSpinnersLeftToDeploy > 0) {
            this._scheduler.scheduleOperation(
                'deploySpinner',
                250,
                () => { this.deploySpinner() }
            );
        }

        this._scheduler.executeDueOperations();
    }

    private deploySpinner(): void {
        debug('SpinnerWave2.deploySpinner');

        const worldDimensions = this._world.dimensions;
        const spinnerStartX = worldDimensions.width / 2;
        const spinnerStartY = -20;
        const leftSpinner = new Spinner(
            this._audioPlayer,
            this._world,
            this._clock,
            new Point(spinnerStartX - 40, spinnerStartY),
            Spinner.Pattern.Type2,
            Spinner.Bias.Left
        );
        this._world.addActor(leftSpinner);
        const rightSpinner = new Spinner(
            this._audioPlayer,
            this._world,
            this._clock,
            new Point(spinnerStartX + 40, spinnerStartY),
            Spinner.Pattern.Type2,
            Spinner.Bias.Right
        );
        this._world.addActor(rightSpinner);

        this._numberOfSpinnersLeftToDeploy-=2;
    }
}
