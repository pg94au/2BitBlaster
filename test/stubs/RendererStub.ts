import {Renderer} from "../../src/devices/Renderer";
import {World} from "../../src/World";

export class RendererStub implements Renderer {
    initialize(world: World) {}
    render() {}
}
