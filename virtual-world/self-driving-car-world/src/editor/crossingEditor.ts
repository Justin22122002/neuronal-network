import {MarkingEditor} from "./markingEditor.ts";
import {Viewport} from "./viewPort.ts";
import {World} from "./world.ts";
import {Crossing} from "../markings/crossing.ts";
import {Point} from "../primitives/point.ts";

export class CrossingEditor extends MarkingEditor
{
    constructor
    (
        viewport: Viewport,
        world: World
    )
    {
        super(viewport, world, world.graph.segments);
    }

    override createMarking(center: Point, directionVector: Point): Crossing {
        return new Crossing
        (
            center,
            directionVector,
            this.world.roadWidth,
            this.world.roadWidth / 2
        );
    }
}