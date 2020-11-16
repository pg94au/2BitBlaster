import {Actor} from "../../src/Actor";
import {Dimensions} from "../../src/Dimensions";
import {ScoreCounter} from "../../src/ScoreCounter";
import {World} from '../../src/World';

export class WorldStub extends World {
    private _onAddActor: (actor: Actor) => void = actor => {};

    constructor(dimensions: Dimensions, scoreCounter: ScoreCounter) {
        super(dimensions, scoreCounter);
    }

    onAddActor(action: (actor: Actor) => void): WorldStub {
        this._onAddActor = action;
        return this;
    }

    addActor(actor: Actor): void {
        super.addActor(actor);
        this._onAddActor(actor);
    }
}
