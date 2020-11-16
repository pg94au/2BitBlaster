import Debug from "debug";
const debug = Debug("Blaster:Bomb");

import {Actor} from "../Actor";
import {AudioPlayer} from "../devices/AudioPlayer";
import {Bounds} from '../Bounds';
import {Direction} from "../devices/Direction";
import {HitArbiter} from '../HitArbiter';
import {HitResult} from '../HitResult';
import {ImageDetails} from '../ImageDetails';
import {Point} from '../Point';
import {Shot} from './Shot';
import {World} from "../World";

export class Bomb extends Shot {
    private readonly _audioPlayer: AudioPlayer;
    private _currentFrame: number = 0;
    private _firstTick: boolean = true;

    constructor(audioPlayer: AudioPlayer, world: World, startingPoint: Point) {
        super(world, startingPoint);
        debug('Bomb constructor');

        this._audioPlayer = audioPlayer;
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
        debug('Bomb.tick');
        super.tick();

        if (this._firstTick) {
            this._audioPlayer.play('bomb_drop');
            this._firstTick = false;
        }

        this._currentFrame = (this._currentFrame + 1) % 4;

        const speed = 10;
        for (let step = 0; step < speed; step++) {
            this.move(Direction.Down);

            if (this._location.y > this._world.getDimensions().height) {
                // When the bomb leaves the world, it becomes inactive.
                debug('De-activating bomb ' + this._id);
                this._active = false;
            }
            else {
                // Check if this bomb has collided with any active enemies.
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
}
