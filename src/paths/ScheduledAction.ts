import {PathAction} from "./PathAction";

export class ScheduledAction {
    private readonly _when: number;
    private readonly _action: PathAction;

    constructor(when: number, action: PathAction) {
        this._when = when;
        this._action = action;
    }

    get when(): number {
        return this._when;
    }

    get action(): PathAction {
        return this._action;
    }
}
