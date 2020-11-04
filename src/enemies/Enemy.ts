/**
 * Created by paul on 2/6/2016.
 */
import Debug from "debug";
const debug = Debug("Blaster:Enemy");

import {Actor} from '../Actor';
import {Explosion} from '../Explosion';
import {Point} from "../Point";
import {ExplosionProperties} from "../ExplosionProperties";

export abstract class Enemy extends Actor {
    protected readonly _audioPlayer: any;
    protected _health: number;

    protected constructor(audioPlayer: any, world: any, startingPoint: Point, initialHealth: number) {
        super(world, startingPoint);

        this._audioPlayer = audioPlayer;
        this._health = initialHealth;
    }

    abstract getExplosionProperties(): ExplosionProperties;

    abstract getScoreTotal(): number;

    getZIndex(): number {
        return 20;
    }

    tick(): void {
        debug('Enemy.tick');

        if (this._health <= 0) {
            this._active = false;

            let scoreTotal = this.getScoreTotal();
            this._world.getScoreCounter().increment(scoreTotal);

            let explosionProperties = this.getExplosionProperties();
            let coordinates = this.getCoordinates();
            let explosion = new Explosion(
                explosionProperties,
                this._audioPlayer,
                this._world,
                coordinates
            );
            this._world.addActor(explosion);
        }
    }
}
