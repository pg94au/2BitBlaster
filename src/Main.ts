import Debug from "debug";
const debug = Debug("Blaster:Main");

import {AudioContextAudioPlayer} from "./devices/AudioContextAudioPlayer";
import {Clock} from './timing/Clock';
import {Game} from './Game';
import {Joystick} from './devices/Joystick';
import {PixiRenderer} from "./devices/PixiRenderer";

Debug.log = console.log.bind(console); // tslint:disable-line

export default class Main {
    public AudioPlayer: typeof AudioContextAudioPlayer = AudioContextAudioPlayer;
    public Clock: typeof Clock = Clock;
    public Game: typeof Game = Game;
    public Joystick: typeof Joystick = Joystick;
    public Renderer: typeof PixiRenderer = PixiRenderer;

    constructor() {
        debug("Constructor called.")
    }
}
