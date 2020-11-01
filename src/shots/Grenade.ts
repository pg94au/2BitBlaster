import Debug from "debug";

const debug = Debug("Blaster:Grenade");

import {Bounds} from '../Bounds';
import {Explosion} from '../Explosion';
import {ExplosionProperties} from "../ExplosionProperties";
import {HitArbiter} from '../HitArbiter';
import {HitResult} from '../HitResult';
import {ImageDetails} from '../ImageDetails';
import {Point} from '../Point';
const Shot = require('./Shot');
const Shrapnel = require('./Shrapnel');

export class Grenade extends Shot {
    private readonly _audioPlayer: any;
    private _currentFrame: number = 0;
    private _firstTick: boolean = true;
    private readonly _initialHeight: number;

    constructor(audioPlayer: any, world: any, startingPoint: Point) {
        super(world, startingPoint);

        this._audioPlayer = audioPlayer;
        this._initialHeight = startingPoint.y;
    }

    getCollisionMask(): Bounds[] {
        return [new Bounds(-12, 12, -12, 12)];
    }

    getDamageAgainst(actor: any): number {
        return 3;
    }

    getImageDetails(): ImageDetails {
        return new ImageDetails('grenade', 24, 30, this._currentFrame);
    }

    tick(): void {
        debug('Grenade.tick');

        super.tick();

        if (this._firstTick) {
            this._audioPlayer.play('bomb_drop');
            this._firstTick = false;
        }

        let speed = 5;
        for (let step = 0; step < speed; step++) {
            this._location = this._location.down();

            if (this._location.y > this._world.getDimensions().height) {
                // If the grenade leaves the world, it becomes inactive.
                debug('De-activating grenade ' + this._id);
                this._active = false;
            }
            else {
                // Check if this grenade has collided with any active enemies.
                let player = this._world.getPlayer();
                if (player) {
                    let hitArbiter = new HitArbiter(this);
                    //TODO: Do something if the hit is ineffective.
                    if (hitArbiter.attemptToHit(player) !== HitResult.Miss) {
                        this._active = false;
                    }
                }

                // If this grenade has fallen far enough, it explodes into shrapnel.
                let distanceCovered = this._location.y - this._initialHeight;
                if (distanceCovered >= 200) {
                    this._active = false;

                    //TODO: Add a small explosion here.
                    let explosion = new Explosion(
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

                    let downShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 270);
                    this._world.addActor(downShrapnel);

                    let leftShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 250);
                    this._world.addActor(leftShrapnel);

                    let rightShrapnel = new Shrapnel(this._audioPlayer, this._world, this._location, 290);
                    this._world.addActor(rightShrapnel);
                }
                else {
                    this._currentFrame = Math.round((distanceCovered / 200) * 24);
                }
            }

            if (!this._active) {
                break;
            }
        }
    }
}
