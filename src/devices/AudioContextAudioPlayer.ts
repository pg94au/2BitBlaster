import Debug from "debug";
const debug = Debug("Blaster:AudioPlayer");
const ResourceLoader = require('resource-loader');

import {AudioPlayer} from "./AudioPlayer";

export class AudioContextAudioPlayer implements AudioPlayer {
    private _decodedAudio: any = {};
    private _audioContext: AudioContext;

    constructor() {
        debug('AudioPlayer constructor');

        ResourceLoader.Resource.setExtensionLoadType('mp3', ResourceLoader.Resource.LOAD_TYPE.XHR);
        ResourceLoader.Resource.setExtensionXhrType('mp3', ResourceLoader.Resource.XHR_RESPONSE_TYPE.BUFFER);

        // @ts-ignore
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        this._audioContext = new AudioContext();
    }

    preLoadSounds(sounds: any[], onSuccess: () => void, onFailure: (errors: any) => void) {
        let resourceLoader = new ResourceLoader();
        let errors: any[] = [];

        let errorHandler = (error: any) => {
            debug('Error event while loading audio resources: ' + error);
            errors.push(error);
        };
        resourceLoader.on('error', errorHandler);

        for (let sound of sounds) {
            resourceLoader.add(sound.name, sound.url);
        }

        resourceLoader.load((rl: any, resources: any) => {
            if (errors.length > 0) {
                onFailure(errors);
            }
            else {
                debug('Successfully loaded ' + resources.length + ' sounds.');
                // self.resources = resources;

                let decodePromises = [];
                let decodeNames: any[] = [];
                for (let i in resources) {
                    decodePromises.push(this._audioContext.decodeAudioData(resources[i].data));
                    decodeNames.push(resources[i].name);
                }
                Promise.all(decodePromises).then(
                    (decodedAudio: any) => {
                        debug('Decoded ' + decodedAudio.length + ' audio samples.');
                        for (let i = 0; i < decodedAudio.length; i++) {
                            this._decodedAudio[decodeNames[i]] = decodedAudio[i];
                        }

                        setTimeout(onSuccess, 0);
                    },
                    (reason: any) => {
                        debug('Promise.all rejected: ' + reason);
                    }
                );
            };
        });
    }

    play(soundName: string): void {
        let decodedAudio = this._decodedAudio[soundName];
        if (decodedAudio) {
            debug('Playing sound ' + soundName);

            let source = this._audioContext.createBufferSource();
            source.buffer = this._decodedAudio[soundName];
            source.connect(this._audioContext.destination);
            source.start(0);
        }
        else {
            throw new Error('Cannot find sound ' + soundName);
        }
    }
}
