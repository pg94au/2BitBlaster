import Debug from "debug";
const debug = Debug("Blaster:Main");

import {AudioPlayer} from './devices/AudioPlayer';
import {Clock} from './timing/Clock';
import {Game} from './Game';
import {Joystick} from './devices/Joystick';
import {PixiRenderer} from "./devices/PixiRenderer";

Debug.disable();

export default class Main {
    public AudioPlayer: typeof AudioPlayer = AudioPlayer;
    public Clock: typeof Clock = Clock;
    public Game: typeof Game = Game;
    public Joystick: typeof Joystick = Joystick;
    public Renderer: typeof PixiRenderer = PixiRenderer;

    constructor() {
        debug("Constructor called.")
    }
}
