import {MarkingEditor} from "./markingEditor.ts";
import {Viewport} from "./viewPort.ts";
import {World} from "./world.ts";
import {Point} from "../primitives/point.ts";
import {Target} from "../markings/target.ts";

export class TargetEditor extends MarkingEditor
{
    constructor
    (
        viewport: Viewport,
        world: World
    )
    {
        super(viewport, world, world.laneGuides);
    }

    override createMarking(center: Point, directionVector: Point): Target
    {
        return new Target
        (
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2
        );
    }
}