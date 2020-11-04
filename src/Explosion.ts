import Debug from "debug";

const debug = Debug("Blaster:Explosion");

import {Actor} from './Actor';
import {ExplosionProperties} from "./ExplosionProperties";
import {ImageDetails} from "./ImageDetails";
import {Point} from "./Point";

export class Explosion extends Actor {
    private readonly _audioPlayer: any;
    private readonly _explosionProperties: ExplosionProperties;
    private _currentFrame: number = 0;
    private _firstTick: boolean = true;

    constructor(explosionProperties: ExplosionProperties, audioPlayer: any, world: any, startingPoint: Point) {
        super(world, startingPoint);
        debug('Explosion constructor for ' + explosionProperties.imageName);
        this._explosionProperties = explosionProperties;
        this._audioPlayer = audioPlayer;
    }

    get imageDetails(): ImageDetails {
        return new ImageDetails(
            this._explosionProperties.imageName,
            this._explosionProperties.numberOfFrames,
            this._explosionProperties.frameWidth,
            Math.floor(this._currentFrame)
        );
    }

    // TODO: Remove this once Actor has this property.
    getImageDetails(): ImageDetails {
        return this.imageDetails;
    }

    get zIndex(): number {
        return 30;
    }

    // TODO: Remove this once Actor has the property.
    getZIndex(): number {
        return this.zIndex;
    }

    tick(): void {
        debug('Explosion.tick');

        if (this._firstTick) {
            if (this._explosionProperties.soundName) {
                this._audioPlayer.play(this._explosionProperties.soundName);
            }
            this._firstTick = false;
        }

        this._currentFrame = this._currentFrame + this._explosionProperties.frameSpeed;

        if (this._currentFrame >= this._explosionProperties.numberOfFrames) {
            // When the explosion has run its course, de-active it.
            debug('De-activating explosion ' + this._id);
            this._active = false;
        }
    }
}
