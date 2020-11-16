/**
 * Created by paul on 2/6/2016.
 */
import Debug from "debug";
const debug = Debug("Blaster:Enemy");

import {Actor} from '../Actor';
import {AudioPlayer} from "../devices/AudioPlayer";
import {Explosion} from '../Explosion';
import {ExplosionProperties} from "../ExplosionProperties";
import {Point} from "../Point";
import {World} from "../World";

export abstract class Enemy extends Actor {
    protected readonly _audioPlayer: AudioPlayer;
    protected _health: number;

    protected constructor(audioPlayer: AudioPlayer, world: World, startingPoint: Point, initialHealth: number) {
        super(world, startingPoint);

        this._audioPlayer = audioPlayer;
        this._health = initialHealth;
    }

    abstract get explosionProperties(): ExplosionProperties;

    abstract get scoreTotal(): number;

    get zIndex(): number {
        return 20;
    }

    tick(): void {
        debug('Enemy.tick');

        if (this._health <= 0) {
            this._active = false;

            const scoreTotal = this.scoreTotal;
            this._world.getScoreCounter().increment(scoreTotal);

            const explosionProperties = this.explosionProperties;
            const coordinates = this.getCoordinates();
            const explosion = new Explosion(
                explosionProperties,
                this._audioPlayer,
                this._world,
                coordinates
            );
            this._world.addActor(explosion);
        }
    }
}
