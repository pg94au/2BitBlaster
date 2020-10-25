import {Point} from "./Point";

export class Bounds {
    private readonly _top: number;
    private readonly _bottom: number;
    private readonly _left: number;
    private readonly _right: number;

    constructor(left: number, right: number, top: number, bottom: number) {
        this._left = left;
        this._right = right;
        this._top = top;
        this._bottom = bottom;
    }

    get left(): number {
        return this._left;
    }

    get right(): number {
        return this._right;
    }

    get top(): number {
        return this._top;
    }

    get bottom(): number {
        return this._bottom;
    }

    translate(point: Point): Bounds {
        return new Bounds(
            this._left + point.x,
            this._right + point.x,
            this._top + point.y,
            this._bottom + point.y
        );
    }

    collidesWith(other: Bounds): boolean {
        let collision: boolean = (
            (
                ((this.left >= other.left) && (this.left <= other.right)) ||
                ((this.right >= other.left) && (this.right <= other.right)) ||
                ((this.left <= other.left) && (this.right >= other.right)) ||
                ((this.left >= other.left) && (this.right <= other.right))
            )
            &&
            (
                ((this.top >= other.top) && (this.top <= other.bottom)) ||
                ((this.bottom >= other.top) && (this.bottom <= other.bottom)) ||
                ((this.top <= other.top) && (this.bottom >= other.bottom)) ||
                ((this.top >= other.top) && (this.bottom <= other.bottom))
            )
        );

        return collision;
    }
}
