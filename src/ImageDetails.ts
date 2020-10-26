export class ImageDetails  {
    private readonly _name: string;
    private readonly _numberOfFrames: number;
    private readonly _frameWidth: number;
    private readonly _currentFrame: number;

    constructor(name: string, numberOfFrames: number, frameWidth: number, currentFrame: number) {
        this._name = name;
        this._numberOfFrames = numberOfFrames;
        this._frameWidth = frameWidth;
        this._currentFrame = currentFrame;
    }

    get name(): string {
        return this._name;
    }

    get numberOfFrames(): number {
        return this._numberOfFrames;
    }

    get frameWidth(): number {
        return this._frameWidth;
    }

    get currentFrame(): number {
        return this._currentFrame;
    }
}
