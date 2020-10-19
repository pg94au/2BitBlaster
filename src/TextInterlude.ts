import Debug from "debug";
const debug = Debug("Blaster:TextInterlude");

import {Scheduler} from "./timing/Scheduler";
import {Text} from "./Text";
import {Clock} from "./timing/Clock";

export class TextInterlude {
    private _world: any;
    private _clock: Clock;
    private _textContent: string;
    private _font: string;
    private _color: string;
    private _xPosition: number;
    private _yPosition: number;
    private _preDisplayTimeInMillis: number;
    private _displayTimeInMillis: number;
    private _postDisplayTimeInMillis: number;
    private _scheduler: any;
    private _interludeText!: Text;
    private _active: boolean = true;

    constructor(
        world: any,
        clock: Clock,
        textContent: string,
        font: string,
        color: string,
        xPosition: number,
        yPosition: number,
        preDisplayTimeInMillis: number,
        displayTimeInMillis: number,
        postDisplayTimeInMillis: number) {
        debug('TextInterlude constructor');
        if (world === undefined) {
            throw new Error('world cannot be undefined');
        }
        if (clock === undefined) {
            throw new Error('clock cannot be undefined');
        }
        if (textContent === undefined) {
            throw new Error('textContent cannot be undefined');
        }
        if (font === undefined) {
            throw new Error('font cannot be undefined');
        }
        if (color === undefined) {
            throw new Error('color cannot be undefined');
        }
        if (xPosition === undefined) {
            throw new Error('xPosition cannot be undefined');
        }
        if (yPosition === undefined) {
            throw new Error('yPosition cannot be undefined');
        }
        if (preDisplayTimeInMillis === undefined) {
            throw new Error('preDisplayTimeInMillis cannot be undefined');
        }
        if (displayTimeInMillis === undefined) {
            throw new Error('displayTimeInMillis cannot be undefined');
        }
        if (postDisplayTimeInMillis === undefined) {
            throw new Error('postDisplayTimeInMillis cannot be undefined');
        }
        this._world = world;
        this._clock = clock;
        this._textContent = textContent;
        this._font = font;
        this._color = color;
        this._xPosition = xPosition;
        this._yPosition = yPosition;
        this._preDisplayTimeInMillis = preDisplayTimeInMillis;
        this._displayTimeInMillis = displayTimeInMillis;
        this._postDisplayTimeInMillis = postDisplayTimeInMillis;
        this._scheduler = new Scheduler(clock);
    }

    get active(): boolean {
        debug('TextInterlude.isActive: ' + this._active);
        return this._active;
    }

    tick(): void {
        debug('TextInterlude.tick');

        let delayBeforeBecomingInactive = this._preDisplayTimeInMillis + this._displayTimeInMillis + this._postDisplayTimeInMillis;
        let delayBeforeShowingText = this._preDisplayTimeInMillis;
        let delayBeforeHidingText = this._preDisplayTimeInMillis + this._displayTimeInMillis;

        let justScheduled = this._scheduler.scheduleOperation('textInterludeEnds', delayBeforeBecomingInactive, () => {
            debug('Text interlude ending');
            this._active = false;
        });

        if (justScheduled) {
            debug('Starting text interlude');
            this._scheduler.scheduleOperation('showInterludeText', delayBeforeShowingText, () => {
                // Add interlude text.
                debug('Adding interlude text [' + this._textContent + ']');
                let worldDimensions = this._world.getDimensions();
                this._interludeText = new Text(this._textContent, this._font, this._color, this._xPosition, this._yPosition);
                this._world.addText(this._interludeText);
            });
            this._scheduler.scheduleOperation('hideInterludeText', delayBeforeHidingText, () => {
                // De-activate interlude text.
                debug('De-activating interlude text [' + this._textContent + ']');
                this._interludeText.active = false;
            });
        }

        this._scheduler.executeDueOperations();
    }
}
