import Debug from "debug";
const debug = Debug("Blaster:Bomb");

import {Actor} from "../Actor";
import {AudioPlayer} from "../devices/AudioPlayer";
import {Bounds} from '../Bounds';
import {Clock} from "../timing/Clock";
import {Direction} from "../devices/Direction";
import {HitArbiter} from '../HitArbiter';
import {HitResult} from '../HitResult';
import {ImageDetails} from '../ImageDetails';
import {Point} from '../Point';
import {Scheduler} from '../timing/Scheduler';
import {Shot} from './Shot';
import {World} from "../World";

export class Web extends Shot {
    private readonly _audioPlayer: AudioPlayer;
    private readonly _scheduler: Scheduler;
    private _currentFrame: number = 0;
    private _firstTick: boolean = true;

    constructor(audioPlayer: AudioPlayer, clock: Clock, world: World, startingPoint: Point) {
        super(world, startingPoint);
        debug('Web constructor');

        this._audioPlayer = audioPlayer;
        this._scheduler = new Scheduler(clock);
        this._currentFrame = 0;
    }

    getCollisionMask(actor: Actor): Bounds[] {
        const offset = this._currentFrame / 10.0 * 45;

        return [new Bounds(-offset, offset, -offset, offset)];
    }

    getDamageAgainst(actor: Actor): number {
        return 1;
    }

    get imageDetails(): ImageDetails {
        return new ImageDetails('web', 10, 100, this._currentFrame);
    }

    tick(): void {
        debug('Web.tick');
        super.tick();

        if (this._firstTick) {
            this._audioPlayer.play('bomb_drop'); // TODO: Find another sound for this?
            this._firstTick = false;
        }

        this._scheduler.scheduleOperation(
            'increaseSize',
            250,
            () => { this._currentFrame = Math.min(this._currentFrame + 1, 9); }
        );
        this._scheduler.executeDueOperations();

        const speed = 10;
        for (let step = 0; step < speed; step++) {
            this.move(Direction.Down);

            if (this._location.y > this._world.dimensions.height) {
                // When the web leaves the world, it becomes inactive.
                debug('De-activating web ' + this._id);
                this._isActive = false;
            }
            else {
                // Check if this web has collided with any active enemies.
                const player = this._world.player;
                if (player) {
                    const hitArbiter = new HitArbiter(this);
                    //TODO: Do something if the hit is ineffective.
                    if (hitArbiter.attemptToHit(player) !== HitResult.Miss) {
                        this._isActive = false;
                    }
                }
            }

            if (!this._isActive) {
                break;
            }
        }
    }
}
