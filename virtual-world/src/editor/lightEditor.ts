import {MarkingEditor} from "./markingEditor.ts";
import {Viewport} from "./viewPort.ts";
import {World} from "./world.ts";
import {Point} from "../primitives/point.ts";
import {Light} from "../markings/light.ts";

export class LightEditor extends MarkingEditor
{
    constructor
    (
        viewport: Viewport,
        world: World
    )
    {
        super(viewport, world, world.laneGuides);
    }

    override createMarking(center: Point, directionVector: Point): Light
    {
        return new Light
        (
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 5
        );
    }
}