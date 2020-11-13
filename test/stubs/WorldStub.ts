import {Actor} from "../../src/Actor";
import {ScoreCounter} from "../../src/ScoreCounter";
import {World} from '../../src/World';

export class WorldStub extends World {
    private _onAddActor: (actor: Actor) => void = actor => {};

    constructor(width: number, height: number, scoreCounter: ScoreCounter) {
        super(width, height, scoreCounter);
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
