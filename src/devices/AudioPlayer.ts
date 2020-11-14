export interface AudioPlayer {
    //TODO: Remove preLoadSounds from this interface.
    preLoadSounds(sounds: any[], onSuccess: () => void, onFailure: (errors: any) => void): void;
    play(soundName: string): void;
}