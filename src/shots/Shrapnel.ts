import Debug from "debug";
const debug = Debug("Blaster:Shrapnel");

import {Actor} from "../Actor";
import {AudioPlayer} from "../devices/AudioPlayer";
import {Bounds} from '../Bounds';
import {HitArbiter} from '../HitArbiter';
import {HitResult} from '../HitResult';
import {ImageDetails} from '../ImageDetails';
import {Point} from '../Point';
import {Shot} from './Shot';
import {World} from "../World";

export class Shrapnel extends Shot {
    private readonly _audioPlayer: AudioPlayer;
    private readonly _trajectory: number;
    private _exactX: number;
    private _exactY: number;
    private _currentFrame: number = 0;
    private _firstTick: boolean = true;

    constructor(audioPlayer: AudioPlayer, world: World, startingPoint: Point, trajectory: number) {
        super(world, startingPoint);
        debug('Shrapnel constructor');

        this._audioPlayer = audioPlayer;
        this._trajectory = trajectory;
        this._exactX = startingPoint.x;
        this._exactY = startingPoint.y;
    }

    getCollisionMask(actor: Actor): Bounds[] {
        return [new Bounds(-5, 5, -5, 5)];
    }

    getDamageAgainst(actor: Actor): number {
        return 1;
    }

    get imageDetails(): ImageDetails {
        return new ImageDetails('bomb', 4, 11, this._currentFrame);
    }

    tick(): void {
        debug('Shrapnel.tick');
        super.tick();

        if (this._firstTick) {
            this._audioPlayer.play('bomb_drop');
            this._firstTick = false;
        }

        this._currentFrame = (this._currentFrame + 1) % 4;

        const speed = 10;
        for (let step = 0; step < speed; step++) {
            this.moveOneStepInDefinedTrajectory();

            if (this._location.y > this._world.getDimensions().height) {
                // When this shrapnel piece leaves the world, it becomes inactive.
                debug('De-activating shrapnel ' + this._id);
                this._active = false;
            }
            else {
                // Check if this piece of shrapnel has collided with any active enemies.
                const player = this._world.getPlayer();
                if (player) {
                    const hitArbiter = new HitArbiter(this);
                    //TODO: Do something if the hit is ineffective.
                    if (hitArbiter.attemptToHit(player) !== HitResult.Miss) {
                        this._active = false;
                    }
                }
            }

            if (!this._active) {
                break;
            }
        }
    }

    private moveOneStepInDefinedTrajectory(): void {
        const trajectoryInRadians = this._trajectory * Math.PI  / 180;

        const xOffset = Math.cos(trajectoryInRadians);
        const yOffset = Math.sin(trajectoryInRadians);

        this._exactX += xOffset;
        this._exactY -= yOffset;

        this._location = new Point(Math.round(this._exactX), Math.round(this._exactY));
    }
}
