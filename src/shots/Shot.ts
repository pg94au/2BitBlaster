/**
 * Created by paul on 1/26/2016.
 */
import Debug from "debug";
import {Point} from "../Point";
const debug = Debug("Blaster:Shot");

const Actor = require('../Actor');

export class Shot extends Actor {
    constructor(world: any, startingPoint: Point) {
        super(world, startingPoint);
    }

    getZIndex(): number {
        return 5;
    }

    tick(): void {
        debug('Shot.tick');
        super.tick();
    }
}
