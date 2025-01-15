import Debug from "debug";
const debug = Debug("Blaster:SimpleWave");
import {random} from 'underscore';

import {AudioPlayer} from "../devices/AudioPlayer";
import {Clock} from "../timing/Clock";
import {Point} from '../Point';
import {Scheduler} from '../timing/Scheduler';
import {Wave} from './Wave';
import {World} from "../World";
import {Zagger} from '../enemies/Zagger';

export class ZigZagWave implements Wave {
    private readonly _audioPlayer: AudioPlayer;
    private readonly _world: World;
    private readonly _clock: Clock;
    private _numberOfEnemiesLeftToDeploy: number = 15;

    private readonly _scheduler: Scheduler;

    constructor(audioPlayer: AudioPlayer, world: World, clock: Clock) {
        debug('ZigZagWave constructor');
        this._audioPlayer = audioPlayer;
        this._world = world;
        this._clock = clock;

        this._scheduler = new Scheduler(clock);

        this._scheduler.scheduleOperation(
            'deploy',
            0,
            () => { this.deployZagger() }
        );
    }

    get isActive(): boolean {
        return (this._numberOfEnemiesLeftToDeploy > 0)
            || (this._world.activeEnemies.length > 0)
            || (this._world.activeExplosions.length > 0);
    }

    tick(): void {
        debug('ZigZagWave.tick');

        this._scheduler.executeDueOperations();

        if (this._numberOfEnemiesLeftToDeploy == 0) {
            this._scheduler.scheduleOperation('next swoop', 0, () => this.scheduleNextSwoop());
        }
    }

    scheduleNextSwoop() : void {
        if (this._world.activeEnemies.length > 0) {
            const timeTillSwoop = random(1000, 5000);
            const zagger = this._world.activeEnemies[Math.floor(random(0, this._world.activeEnemies.length))] as Zagger;
            this._scheduler.scheduleOperation(
                'next swoop',
                timeTillSwoop,
                () => zagger.swoop()
            );
        }
    }

    deployZagger(): void {
        if (this._numberOfEnemiesLeftToDeploy > 0) {
            const worldDimensions = this._world.dimensions;
            const zaggerStartingPoint = new Point(
                Math.floor(random(0, worldDimensions.width-50)),
                -20
            );
            const zaggerHomeX = (5-(this._numberOfEnemiesLeftToDeploy-1)%5) * 80;
            const zaggerHomeY = 100 + Math.floor((this._numberOfEnemiesLeftToDeploy-1)/5) * 70;
            const zaggerHomePosition = new Point(zaggerHomeX, zaggerHomeY);
            const zagger = new Zagger(this._audioPlayer, this._world, this._clock, zaggerStartingPoint, zaggerHomePosition);
            this._world.addActor(zagger);

            this._numberOfEnemiesLeftToDeploy--;

            this._scheduler.scheduleOperation(
                'deploy',
                250,
                () => { this.deployZagger() }
            );
        }
    }
}
