import {AudioPlayer} from "../../src/devices/AudioPlayer";

export class AudioPlayerStub implements AudioPlayer {
    private _onPlay: (soundName: string) => void = (soundName: string) => {};

    onPlay(value: (soundName: string) => void): AudioPlayer {
        this._onPlay = value;
        return this;
    }

    play(soundName: string): void {
        this._onPlay(soundName);
    }

    preLoadSounds(sounds: any[], onSuccess: () => void, onFailure: (errors: any) => void): void {
    }
}
