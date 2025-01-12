import Debug from "debug";
const debug = Debug("Blaster:SimpleWave");
import {random} from 'underscore';

import {AudioPlayer} from "../devices/AudioPlayer";
import {Clock} from "../timing/Clock";
import {Point} from '../Point';
import {Zagger} from '../enemies/Zagger';
import {Wave} from './Wave';
import {World} from "../World";

export class ZigZagWave implements Wave {
    private readonly _audioPlayer: AudioPlayer;
    private readonly _world: World;
    private readonly _clock: Clock;
    private _addNextEnemyAt: Date = new Date();
    private _numberOfEnemiesLeftToDeploy: number = 15;

    constructor(audioPlayer: AudioPlayer, world: World, clock: Clock) {
        debug('ZigZagWave constructor');
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
        debug('ZigZagWave.tick');

        //TODO: This is just a simple demonstration of how a wave can manage adding enemies to the world.
        if (this._numberOfEnemiesLeftToDeploy > 0) {
            // Add new enemy when the time comes, but only if a maximum allowed aren't already active.
            if ((this._addNextEnemyAt <= new Date()) && (this._world.activeEnemies.length < 15)) {
                // Space out the addition of enemies.
                this._addNextEnemyAt = new Date(Date.now() + 250);

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
            }
        }
    }
}
