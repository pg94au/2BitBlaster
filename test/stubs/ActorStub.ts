import {Actor} from "../../src/Actor";
import {Point} from "../../src/Point";
import {ImageDetails} from "../../src/ImageDetails";

export class ActorStub extends Actor {
    constructor(world: any, startCoordinates: Point) {
        super(world, startCoordinates);
    }

    getImageDetails(): ImageDetails {
        throw new Error('Not implemented');
    }

    getZIndex(): number {
        return 0;
    }

    tick() {
    }
}