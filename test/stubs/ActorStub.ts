import {Actor} from "../../src/Actor";
import {Bounds} from "../../src/Bounds";
import {ImageDetails} from "../../src/ImageDetails";
import {Point} from "../../src/Point";
import {World} from "../../src/World";

export class ActorStub extends Actor {
    constructor(world: World, startCoordinates: Point) {
        super(world, startCoordinates);
    }

    get imageDetails(): ImageDetails {
        throw new Error('Not implemented');
    }

    get zIndex(): number {
        return 0;
    }

    tick() {
    }

    getCollisionMask(actor: Actor): Bounds[] {
        return [];
    }
}