import Debug from "debug";
const debug = Debug("Blaster:Bullet");

import {Actor} from "../Actor";
import {AudioPlayer} from "../devices/AudioPlayer";
import {Bounds} from '../Bounds';
import {Direction} from "../devices/Direction";
import {Enemy} from "../enemies/Enemy";
import {HitArbiter} from '../HitArbiter';
import {HitResult} from '../HitResult';
import {ImageDetails} from '../ImageDetails';
import {Point} from '../Point';
import {Shot} from './Shot';
import {World} from "../World";

export class Bullet extends Shot {
    private readonly _audioPlayer: AudioPlayer;
    private _currentFrame: number = 0;
    private _firstTick: boolean = true;

    constructor(audioPlayer: AudioPlayer, world: World, startingPoint: Point) {
        super(world, startingPoint);
        debug('Bullet constructor');

        this._audioPlayer = audioPlayer;
    }

    getCollisionMask(actor: Actor): Bounds[] {
        return [new Bounds(-5, 5, -5, 5)];
    }

    getDamageAgainst(actor: Actor): number {
        return 1;
    }

    get imageDetails(): ImageDetails {
        return new ImageDetails('bullet', 4, 11, this._currentFrame);
    }

    tick(): void {
        debug('Bullet.tick');

        if (this._firstTick) {
            this._audioPlayer.play('bullet_fire');
            this._firstTick = false;
        }

        this._currentFrame = (this._currentFrame + 1) % 4;

        const speed: number = 10;
        for (let step = 0; step < speed; step++) {
            this.move(Direction.Up);

            if (this._location.y < 0) {
                // When the bullet leaves the world, it becomes inactive.
                debug('De-activating bullet ' + this._id);
                this._active = false;
            }
            else {
                const hitArbiter = new HitArbiter(this);

                // Check if this bullet has collided with any active enemies.
                const activeEnemies = this._world.getActiveEnemies();
                activeEnemies.forEach((enemy: Enemy) => {
                    //TODO: Do something if the hit is ineffective.
                    if (this._active) {
                        if (hitArbiter.attemptToHit(enemy) !== HitResult.Miss) {
                            this._active = false;
                        }
                    }
                });
            }

            if (!this._active) {
                break;
            }
        }
    }
}
