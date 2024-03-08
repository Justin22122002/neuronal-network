import {MarkingEditor} from "./markingEditor.ts";
import {Point} from "../primitives/point.ts";
import {Start} from "../markings/start.ts";
import {Viewport} from "./viewPort.ts";
import {World} from "./world.ts";

export class StartEditor extends MarkingEditor
{
    constructor
    (
        viewport: Viewport,
        world: World
    )
    {
        super(viewport, world, world.laneGuides);
    }

    createMarking(center: Point, directionVector: Point): Start
    {
        return new Start
        (
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2
        );
    }
}