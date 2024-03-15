import {MarkingEditor} from "./markingEditor.ts";
import {Viewport} from "./viewPort.ts";
import {World} from "./world.ts";
import {Point} from "../primitives/point.ts";
import {Stop} from "../markings/stop.ts";

export class StopEditor extends MarkingEditor
{
    constructor
    (
        viewport: Viewport,
        world: World
    )
    {
        super(viewport, world, world.laneGuides);
    }

    override createMarking(center: Point, directionVector: Point): Stop
    {
        return new Stop
        (
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2
        );
    }
}