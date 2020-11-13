import {World} from "../World";

export interface Renderer {
    initialize(world: World): void;
    render(): void;
}
