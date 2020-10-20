import {PathAction} from "./PathAction";
import {Point} from "../Point";

export class PathEntry {
    private readonly _action: PathAction;
    private readonly _location: Point | null;

    constructor(action: PathAction, location: Point | null) {
        this._action = action;
        this._location = location;
    }

    get action(): PathAction {
        return this._action;
    }

    get location(): Point | null {
        return this._location;
    }
}
