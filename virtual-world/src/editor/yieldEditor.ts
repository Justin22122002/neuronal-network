import {MarkingEditor} from "./markingEditor.ts";
import {Viewport} from "./viewPort.ts";
import {World} from "./world.ts";
import {Point} from "../primitives/point.ts";
import {Yield} from "../markings/yield.ts";

export class YieldEditor extends MarkingEditor
{
    constructor
    (
        viewport: Viewport,
        world: World
    )
    {
        super(viewport, world, world.laneGuides);
    }

    override createMarking(center: Point, directionVector: Point): Yield
    {
        return new Yield
        (
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2
        );
    }
}