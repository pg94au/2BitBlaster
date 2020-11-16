import Debug from "debug";

const debug = Debug("Blaster:Explosion");

import {Actor} from './Actor';
import {AudioPlayer} from "./devices/AudioPlayer";
import {Bounds} from "./Bounds";
import {ExplosionProperties} from "./ExplosionProperties";
import {ImageDetails} from "./ImageDetails";
import {Point} from "./Point";
import {World} from "./World";

export class Explosion extends Actor {
    private readonly _audioPlayer: AudioPlayer;
    private readonly _explosionProperties: ExplosionProperties;
    private _currentFrame: number = 0;
    private _firstTick: boolean = true;

    constructor(explosionProperties: ExplosionProperties, audioPlayer: AudioPlayer, world: World, startingPoint: Point) {
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

    get zIndex(): number {
        return 30;
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
            this._isActive = false;
        }
    }

    getCollisionMask(actor: Actor): Bounds[] {
        return [];
    }
}
