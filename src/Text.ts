import Debug from "debug";
const debug = Debug("Blaster:Text");

import {v4} from 'uuid';
import {Point} from "./Point";

export class Text {
    private readonly _id: string = v4();
    private readonly _content: string;
    private readonly _font: string;
    private readonly _color: string;
    private readonly _location: Point;
    private _active: boolean = true;

    constructor(content: string, font: string, color: string, startX: number, startY: number) {
        debug('Text constructor');
        this._content = content;
        this._font = font;
        this._color = color;
        this._location = new Point(startX, startY);
    }

    get id(): string {
        return this._id;
    }

    get coordinates(): Point {
        return this._location;
    }

    get content(): string {
        return this._content;
    }

    get font(): string {
        return this._font;
    }

    get color(): string {
        return this._color;
    }

    get active(): boolean {
        return this._active;
    }

    set active(value: boolean) {
        this._active = value;
    }
}
