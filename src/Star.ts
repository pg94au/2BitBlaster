import Debug from "debug";

const debug = Debug("Blaster:Star");

import {random} from 'underscore';

const Actor = require('./Actor');
import {Direction} from './devices/Direction';
import {ImageDetails} from './ImageDetails';
import {Point} from './Point';

export class Star extends Actor {
    private readonly _flashRate: number = random(5, 10);
    private _flashCounter: number = 0;
    private _frameIndices: any[] = [];
    private _currentFrame: number = 0;

    constructor(world: any, startingPoint: Point) {
        super(world, startingPoint);

        debug('Star constructor');

        let startFrame = random(0, 2);
        let endFrame = random(startFrame, 2);

        for (let i = startFrame; i <= endFrame; i++) {
            this._frameIndices.push(i);
        }
        for (let i = endFrame; i >= startFrame; i--) {
            this._frameIndices.push(i);
        }
    }

    get imageDetails(): ImageDetails {
        return new ImageDetails('star', 3, 7, this._frameIndices[this._currentFrame]);
    }

    // TODO: Remove this when only the property is used.
    getImageDetails(): ImageDetails {
        return this.imageDetails;
    }

    get zIndex(): number {
        return 0;
    }

    // TOD: Remove this when only the property is used.
    getZIndex(): number {
        return this.zIndex;
    }

    tick(): void {
        super.tick();
        debug('Star.tick');

        this.move(Direction.Down);

        if (this._location.y > this._world.getDimensions().height) {
            // When the star leaves the world, it becomes inactive.
            debug('De-activating star ' + this._id);
            this._active = false;
        }

        // Make the star sparkle.
        this._flashCounter = (this._flashCounter + 1) % this._flashRate;

        if (this._flashCounter == 0) {
            this._currentFrame = (this._currentFrame + 1) % this._frameIndices.length;
        }
    }
}