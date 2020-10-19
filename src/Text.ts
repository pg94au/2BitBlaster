import Debug from "debug";
const debug = Debug("Blaster:Text");

import {v4} from 'uuid';

export class Text {
    private readonly _id: string = v4();
    private readonly _content: string;
    private readonly _font: string;
    private readonly _color: string;
    private readonly _x: number;
    private readonly _y: number;
    private _active: boolean = true;

    constructor(content: string, font: string, color: string, startX: number, startY: number) {
        debug('Text constructor');
        this._content = content;
        this._font = font;
        this._color = color;
        this._x = startX;
        this._y = startY;
    }

    get id(): string {
        return this._id;
    }

    get coordinates(): any {
        return {x: this._x, y: this._y};
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
}

// const { v4: uuidv4 } = require('uuid');
//
// var Text = function(content, font, color, startX, startY) {
//     debug('Text constructor');
//     this._id = uuidv4();
//     this._content = content;
//     this._font = font;
//     this._color = color;
//     this._x = startX;
//     this._y = startY;
//     this._active = true;
// };
//
// Text.prototype.getId = function() {
//     return this._id;
// };
//
// Text.prototype.getCoordinates = function() {
//     return {x: this._x, y: this._y};
// };
//
// Text.prototype.tick = function() {
//     debug('Text.tick');
// };
//
// Text.prototype.getContent = function() {
//     return this._content;
// };
//
// Text.prototype.getColor = function() {
//     return this._color;
// };
//
// Text.prototype.getFont = function() {
//     return this._font;
// };
//
// Text.prototype.isActive = function() {
//     debug('Text.isActive: ' + this._active);
//     return this._active
// };
//
// module.exports = Text;
