/**
 * Created by paul on 1/26/2016.
 */
import Debug from "debug";
import {Point} from "../Point";
const debug = Debug("Blaster:Shot");

import {Actor} from '../Actor';
import {World} from "../World";

export abstract class Shot extends Actor {
    protected constructor(world: World, startingPoint: Point) {
        super(world, startingPoint);
    }

    getZIndex(): number {
        return 5;
    }

    tick(): void {
        debug('Shot.tick');
    }

    abstract getDamageAgainst(actor: Actor): number;
}
