// @ts-ignore
import * as nodeWindowPolyfill from 'node-window-polyfill';

// AudioPlayer that we are extending will reference window.
nodeWindowPolyfill.register();

// @ts-ignore
window.AudioContext = class {};

const AudioPlayer = require('../../src/devices/AudioPlayer');

export class AudioPlayerStub extends AudioPlayer {
    private _onPlay: (soundName: string) => void = (soundName: string) => {};

    onPlay(value: (soundName: string) => void): typeof AudioPlayer {
        this._onPlay = value;
        return this;
    }

    play(soundName: string): void {
        this._onPlay(soundName);
    }
}
