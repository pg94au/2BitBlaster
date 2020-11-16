import Debug from "debug";
const debug = Debug("Blaster:SecondWave");

import {AudioPlayer} from "../devices/AudioPlayer";
import {Clock} from "../timing/Clock";
import {Point} from '../Point';
import {Probe} from '../enemies/Probe';
import {Wave} from './Wave';
import {World} from "../World";

export class SecondWave implements Wave {
    private readonly _audioPlayer: AudioPlayer;
    private readonly _world: World;
    private readonly _clock: Clock;
    private _addNextEnemyAt: Date = new Date();
    private _numberOfEnemiesLeftToDeploy: number = 10;

    constructor(audioPlayer: AudioPlayer, world: World, clock: Clock) {
        debug('SecondWave constructor');
        this._audioPlayer = audioPlayer;
        this._world = world;
        this._clock = clock;
    }

    get isActive(): boolean {
        return (this._numberOfEnemiesLeftToDeploy > 0)
            || (this._world.activeEnemies.length > 0)
            || (this._world.activeExplosions.length > 0);
    }

    tick(): void {
        debug('SecondWave.tick');

        //TODO: This is just a simple demonstration of how a wave can manage adding enemies to the world.
        if (this._numberOfEnemiesLeftToDeploy > 0) {
            if ((this._addNextEnemyAt <= new Date()) && (this._world.activeEnemies.length < 5)) {
                // Space out the addition of enemies.
                this._addNextEnemyAt = new Date();
                this._addNextEnemyAt.setSeconds(this._addNextEnemyAt.getSeconds() + 1);

                const probeStartingPoint = new Point(240, -10);
                const _probe = new Probe(this._audioPlayer, this._world, this._clock, probeStartingPoint);
                this._world.addActor(_probe);

                this._numberOfEnemiesLeftToDeploy--;
            }
        }
    }
}
