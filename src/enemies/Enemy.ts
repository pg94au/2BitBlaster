/**
 * Created by paul on 2/6/2016.
 */
import Debug from "debug";
const debug = Debug("Blaster:Enemy");

const Actor = require('../Actor');
import {Explosion} from '../Explosion';
import {Point} from "../Point";
import {ExplosionProperties} from "../ExplosionProperties";

export abstract class Enemy extends Actor {
    protected readonly _audioPlayer: any;

    protected constructor(audioPlayer: any, world: any, startingPoint: Point) {
        super(world, startingPoint);

        this._audioPlayer = audioPlayer;
    }

    abstract getExplosionProperties(): ExplosionProperties;

    abstract getScoreTotal(): number;

    getZIndex(): number {
        return 20;
    }

    tick(): void {
        debug('Enemy.tick');
        super.tick();

        if (this._health <= 0) {
            this._active = false;

            let scoreTotal = this.getScoreTotal();
            this._world.getScoreCounter().increment(scoreTotal);

            let explosionProperties = this.getExplosionProperties();
            let saucerCoordinates = this.getCoordinates();
            let saucerExplosion = new Explosion(
                explosionProperties,
                this._audioPlayer,
                this._world,
                saucerCoordinates
            );
            this._world.addActor(saucerExplosion);
        }
    }
}
