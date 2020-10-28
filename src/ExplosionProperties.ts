export class ExplosionProperties {
    private readonly _imageName: string;
    private readonly _numberOfFrames: number;
    private readonly _frameWidth: number;
    private readonly _frameSpeed: number;
    private readonly _soundName: string | null;

    constructor(
        imageName: string,
        numberOfFrames: number,
        frameWidth: number,
        frameSpeed: number,
        soundName: string | null = null
    ) {
        this._imageName = imageName;
        this._numberOfFrames = numberOfFrames;
        this._frameWidth = frameWidth;
        this._frameSpeed = frameSpeed;
        this._soundName = soundName;
    }

    get imageName(): string {
        return this._imageName;
    }

    get numberOfFrames(): number {
        return this._numberOfFrames;
    }

    get frameWidth(): number {
        return this._frameWidth;
    }

    get frameSpeed(): number {
        return this._frameSpeed;
    }

    get soundName(): string | null {
        return this._soundName;
    }
}