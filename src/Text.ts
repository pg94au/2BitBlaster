import Debug from "debug";
const debug = Debug("Blaster:Text");

import {v4} from 'uuid';
import {Point} from "./Point";

export class Text {
    private readonly _id: string = v4();
    private readonly _content: string;
    private readonly _fontFamily: string;
    private readonly _fontSize: number;
    private readonly _fillColor: string;
    private readonly _location: Point;
    private _isActive: boolean = true;

    constructor(content: string, fontFamily: string, fontSize: number, fillColor: string, startX: number, startY: number) {
        debug('Text constructor');
        this._content = content;
        this._fontFamily = fontFamily;
        this._fontSize = fontSize;
        this._fillColor = fillColor;
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

    get fontFamily(): string {
        return this._fontFamily;
    }

    get fontSize(): number {
        return this._fontSize;
    }

    get fillColor(): string {
        return this._fillColor;
    }

    get active(): boolean {
        return this._isActive;
    }

    set active(value: boolean) {
        this._isActive = value;
    }
}
