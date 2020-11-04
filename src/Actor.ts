import Debug from "debug";
const debug = Debug("Blaster:Actor");
import {v4 as uuid} from 'uuid';

import {Direction} from './devices/Direction';
import {ImageDetails} from './ImageDetails';
import {Point} from './Point';

export abstract class Actor {
    protected readonly _id: string = uuid();
    protected readonly _world: any;
    protected _location: Point;
    protected _active: boolean = true;

    protected constructor(world: any, startCoordinates: Point) {
        debug('Actor constructor');
        this._world = world;
        this._location = startCoordinates;
    }

    getId(): string {
        return this._id;
    }

    move(direction: Direction) {
        if (direction & Direction.Up) {
            this._location = this._location.up();
        }
        if (direction & Direction.Down) {
            this._location = this._location.down();
        }
        if (direction & Direction.Left) {
            this._location = this._location.left();
        }
        if (direction & Direction.Right) {
            this._location = this._location.right();
        }
    }

    getCoordinates(): Point {
        return this._location;
    }

    abstract getZIndex(): number;

    hitBy(actor: Actor, damage: number): boolean {
        debug('Actor.hitBy ' + actor + ' for ' + damage);
        // By default, an actor isn't affected by hits.
        return false;
    }

    abstract tick(): void;

    abstract getImageDetails(): ImageDetails;

    isActive(): boolean {
        debug('Actor.isActive: ' + this._active);
        return this._active;
    }
}
