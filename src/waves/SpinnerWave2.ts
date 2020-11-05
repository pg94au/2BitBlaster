import Debug from "debug";
const debug = Debug("Blaster:SpinnerWave2");

import {Point} from '../Point';
import {Spinner} from '../enemies/Spinner';
import {Scheduler} from '../timing/Scheduler';
import {Clock} from "../timing/Clock";
import {World} from "../World";

export class SpinnerWave2 implements Wave {
    private readonly _audioPlayer: any;
    private readonly _world: World;
    private readonly _clock: Clock;
    private readonly _scheduler: Scheduler;
    private _numberOfSpinnersLeftToDeploy: number = 10;

    constructor(audioPlayer: any, world: World, clock: Clock) {
        debug('SpinnerWave2 constructor');

        this._audioPlayer = audioPlayer;
        this._world = world;
        this._clock = clock;
        this._scheduler = new Scheduler(clock);
    }

    isActive(): boolean {
        return (this._numberOfSpinnersLeftToDeploy > 0)
            || (this._world.getActiveEnemies().length > 0)
            || (this._world.getActiveExplosions().length > 0);
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

    deploySpinner(): void {
        debug('SpinnerWave2.deploySpinner');

        let worldDimensions = this._world.getDimensions();
        let spinnerStartX = worldDimensions.width / 2;
        let spinnerStartY = -20;
        let leftSpinner = new Spinner(
            this._audioPlayer,
            this._world,
            this._clock,
            new Point(spinnerStartX - 40, spinnerStartY),
            Spinner.Pattern.Type2,
            Spinner.Bias.Left
        );
        this._world.addActor(leftSpinner);
        let rightSpinner = new Spinner(
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
