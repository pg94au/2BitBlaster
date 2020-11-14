import Debug from "debug";
const debug = Debug("Blaster:AudioPlayer");
import {Loader} from 'resource-loader';
import ResourceMap = Loader.ResourceMap;

import {AudioPlayer} from "./AudioPlayer";

export class AudioContextAudioPlayer implements AudioPlayer {
    private _decodedAudio: any = {};
    private _audioContext: AudioContext;

    constructor() {
        debug('AudioPlayer constructor');

        // @ts-ignore
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        this._audioContext = new AudioContext();
    }

    preLoadSounds(sounds: any[], onSuccess: () => void, onFailure: (errors: any) => void) {
        let loader = new Loader();
        let errors: any[] = [];

        let errorHandler = (error: any) => {
            debug('Error event while loading audio resources: ' + error);
            errors.push(error);
        };
        loader.onError.add(errorHandler);

        for (let sound of sounds) {
            loader.add(sound.name, sound.url);
        }

        loader.load((rl: Loader, resourceMap: ResourceMap) => {
            if (errors.length > 0) {
                onFailure(errors);
            }
            else {
                debug('Successfully loaded ' + resourceMap.length + ' sounds.');

                for (let name in resourceMap) {
                    if (resourceMap.hasOwnProperty(name)) {
                        this._decodedAudio[name] = resourceMap[name]!.data;
                    }
                }

                onSuccess();
            }
        });
    }

    play(soundName: string): void {
        let decodedAudio = this._decodedAudio[soundName];
        if (decodedAudio) {
            debug('Playing sound ' + soundName);

            let audio = decodedAudio.cloneNode(true);
            audio.play();
        }
        else {
            throw new Error('Cannot find sound ' + soundName);
        }
    }
}
