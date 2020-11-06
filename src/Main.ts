import Debug from "debug";
const debug = Debug("Blaster:Main");

import AudioPlayer from './devices/AudioPlayer';
import {Clock} from './timing/Clock';
import {Game} from './Game';
import {Joystick} from './devices/Joystick';
import Renderer from './devices/Renderer';

Debug.disable();

console.log('Hello world');

export default class Main {
    // @ts-ignore
    public AudioPlayer: AudioPlayer = AudioPlayer;
    // @ts-ignore
    public Clock: Clock = Clock;
    // @ts-ignore
    public Game: Game = Game;
    // @ts-ignore
    public Joystick: Joystick = Joystick;
    // @ts-ignore
    public Renderer: Renderer = Renderer;

    constructor() {
        debug("Constructor called.")
    }

    sayHello(): void {
        console.log('Hi there');
    }
}
