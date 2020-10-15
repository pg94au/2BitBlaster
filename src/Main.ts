import Debug from "debug";
const debug = Debug("Blaster:Main");

import {Clock} from './timing/Clock';

Debug.disable();

console.log('Hello world');

export class Main {
    // @ts-ignore
    public Clock: Clock;
}
