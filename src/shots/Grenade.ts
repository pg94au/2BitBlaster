import Debug from "debug";
const debug = Debug("Blaster:Grenade");

import {Actor} from "../Actor";
import {AudioPlayer} from "../devices/AudioPlayer";
import {Bounds} from '../Bounds';
import {Direction} from "../devices/Direction";
import {Explosion} from '../Explosion';
import {ExplosionProperties} from "../ExplosionProperties";
import {HitArbiter} from '../HitArbiter';
import {HitResult} from '../HitResult';
import {ImageDetails} from '../ImageDetails';
import {Point} from '../Point';
import {Shot} from './Shot';
import {Shrapnel} from './Shrapnel';
import {World} from "../World";

export class Grenade extends Shot {
    private readonly _audioPlayer: AudioPlayer;
    private _currentFrame: number = 0;
    private _firstTick: boolean = true;
    private readonly _initialHeight: number;

    constructor(audioPlayer: AudioPlayer, world: World, startingPoint: Point) {
        super(world, startingPoint);

        this._audioPlayer = audioPlayer;
        this._initialHeight = startingPoint.y;
    }

    getCollisionMask(actor: Actor): Bounds[] {
        return [new Bounds(-12, 12, -12, 12)];
    }

    getDamageAgainst(actor: Actor): number {
        return 3;
    }

    get imageDetails(): ImageDetails {
        return new ImageDetails('grenade', 24, 30, this._currentFrame);
    }

    tick(): void {
        debug('Grenade.tick');

        super.tick();

        if (this._firstTick) {
            this._audioPlayer.play('bomb_drop');
            this._firstTick = false;
        }

        const speed = 5;
        for (let step = 0; step < speed; step++) {
            this.move(Direction.Down);

            if (this._location.y > this._world.dimensions.height) {
                // If the grenade leaves the world, it becomes inactive.
                debug('De-activating grenade ' + this._id);
                this._isActive = false;
            }
            else {
                // Check if this grenade has collided with any active enemies.
                const player = this._world.player;
                if (player) {
                    const hitArbiter = new HitArbiter(this);
                    //TODO: Do something if the hit is ineffective.
                    if (hitArbiter.attemptToHit(player) !== HitResult.Miss) {
                        this._isActive = false;
                    }
                }

                // If this grenade has fallen far enough, it explodes into shrapnel.
                const distanceCovered = this._location.y - this._initialHeight;
                if (distanceCovered >= 200) {
                    this._isActive = false;

                    //TODO: Add a small explosion here.
                    const explosion = new Explosion(
                        new ExplosionProperties(
                            'grenade_explosion',
                            7,
                            50,
                            1.5,
                            'saucer_explosion'
                        ),
                        this._audioPlayer,
                        this._world,
                        this._location
                    );
                    this._world.addActor(explosion);

                    const downShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 270);
                    this._world.addActor(downShrapnel);

                    const leftShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 250);
                    this._world.addActor(leftShrapnel);

                    const rightShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 290);
                    this._world.addActor(rightShrapnel);
                }
                else {
                    this._currentFrame = Math.round((distanceCovered / 200) * 24);
                }
            }

            if (!this._isActive) {
                break;
            }
        }
    }
}
