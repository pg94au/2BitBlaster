import Debug from "debug";
const debug = Debug("Blaster:TextInterlude");

import {Clock} from "./timing/Clock";
import {Scheduler} from "./timing/Scheduler";
import {Text} from "./Text";
import {World} from "./World";

export class TextInterlude {
    private _world: World;
    private _clock: Clock;
    private readonly _textContent: string;
    private readonly _fontFamily: string;
    private readonly _fontSize: number;
    private readonly _fillColor: string;
    private readonly _xPosition: number;
    private readonly _yPosition: number;
    private readonly _preDisplayTimeInMillis: number;
    private readonly _displayTimeInMillis: number;
    private readonly _postDisplayTimeInMillis: number;
    private _scheduler: Scheduler;
    private _interludeText!: Text;
    private _isActive: boolean = true;

    constructor(
        world: World,
        clock: Clock,
        textContent: string,
        fontFamily: string,
        fontSize: number,
        fillColor: string,
        xPosition: number,
        yPosition: number,
        preDisplayTimeInMillis: number,
        displayTimeInMillis: number,
        postDisplayTimeInMillis: number
    ) {
        debug('TextInterlude constructor');
        this._world = world;
        this._clock = clock;
        this._textContent = textContent;
        this._fontFamily = fontFamily;
        this._fontSize = fontSize;
        this._fillColor = fillColor;
        this._xPosition = xPosition;
        this._yPosition = yPosition;
        this._preDisplayTimeInMillis = preDisplayTimeInMillis;
        this._displayTimeInMillis = displayTimeInMillis;
        this._postDisplayTimeInMillis = postDisplayTimeInMillis;
        this._scheduler = new Scheduler(clock);
    }

    get active(): boolean {
        debug('TextInterlude.isActive: ' + this._isActive);
        return this._isActive;
    }

    tick(): void {
        debug('TextInterlude.tick');

        const delayBeforeBecomingInactive = this._preDisplayTimeInMillis + this._displayTimeInMillis + this._postDisplayTimeInMillis;
        const delayBeforeShowingText = this._preDisplayTimeInMillis;
        const delayBeforeHidingText = this._preDisplayTimeInMillis + this._displayTimeInMillis;

        const justScheduled = this._scheduler.scheduleOperation('textInterludeEnds', delayBeforeBecomingInactive, () => {
            debug('Text interlude ending');
            this._isActive = false;
        });

        if (justScheduled) {
            debug('Starting text interlude');
            this._scheduler.scheduleOperation('showInterludeText', delayBeforeShowingText, () => {
                // Add interlude text.
                debug('Adding interlude text [' + this._textContent + ']');
                const worldDimensions = this._world.dimensions;
                this._interludeText = new Text(
                    this._textContent,
                    this._fontFamily,
                    this._fontSize,
                    this._fillColor,
                    this._xPosition,
                    this._yPosition
                );
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
