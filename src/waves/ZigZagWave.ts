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
    private readonly _swoopers: Map<number, Zagger> = new Map<number, Zagger>();

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
    }

    scheduleNextSwoop(swoopIndex: number) : void {
        // If no swooper has been chosen yet, or if the last chosen swooper is dead or waiting, schedule a new swoop.
        if (!this._swoopers.has(swoopIndex) || (!this._world.activeEnemies.includes(this._swoopers.get(swoopIndex)!) || this._swoopers.get(swoopIndex)!.state === Zagger.State.Waiting)) {
            if (this._world.activeEnemies.length > 0) {
                const timeTillSwoop = random(100, 1000);
                this._scheduler.scheduleOperation(
                    `next swoop ${swoopIndex}`,
                    timeTillSwoop,
                    () => {
                        const waitingZaggers = this._world.activeEnemies.filter(enemy => (enemy as Zagger).state === Zagger.State.Waiting);
                        const zagger = waitingZaggers[random(waitingZaggers.length-1)] as Zagger;
                        this._swoopers.set(swoopIndex, zagger);

                        zagger.swoop();

                        this.scheduleNextSwoop(swoopIndex);
                    }
                );
            }
        }

        // TODO: This could be done such that we pass a callback to the swoop method, which gets called when the swoop is complete (or die).  We wouldn't have to call this repeatedly.
        this._scheduler.scheduleOperation(`next swoop ${swoopIndex}`, 0, () => this.scheduleNextSwoop(swoopIndex));
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
                50,
                () => { this.deployZagger() }
            );
        }
        else {
            // Get two swoopers going right away, then let them get re-scheduled as they finish.
            this._scheduler.scheduleOperation('next swoop 1', 0, () => this.scheduleNextSwoop(0));
            this._scheduler.scheduleOperation('next swoop 2', 500, () => this.scheduleNextSwoop(1));
        }
    }
}
