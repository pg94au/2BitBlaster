import {Wave} from "../../src/waves/Wave";

export class WaveStub implements Wave {
    private _isActive: boolean = true;
    private _onTick: () => void = () => {};

    setInactive(): WaveStub {
        this._isActive = false;
        return this;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    onTick(value: () => void): WaveStub {
        this._onTick = value;
        return this;
    }

    tick(): void {
        this._onTick();
    }
}