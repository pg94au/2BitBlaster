import {Point} from "./Point";

export class Bounds {
    private readonly _top: number;
    private readonly _bottom: number;
    private readonly _left: number;
    private readonly _right: number;

    constructor(top: number, bottom: number, left: number, right: number) {
        this._top = top;
        this._bottom = bottom;
        this._left = left;
        this._right = right;
    }

    get top(): number {
        return this._top;
    }

    get bottom(): number {
        return this._bottom;
    }

    get left(): number {
        return this._left;
    }

    get right(): number {
        return this._right;
    }

    translate(point: Point): Bounds {
        return new Bounds(
            this._top + point.y,
            this._bottom + point.y,
            this._left + point.x,
            this._right + point.x
        );
    }
}
