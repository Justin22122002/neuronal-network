import {MarkingEditor} from "./markingEditor.ts";
import {Point} from "../primitives/point.ts";
import {Parking} from "../markings/parking.ts";
import {Viewport} from "./viewPort.ts";
import {World} from "./world.ts";

export class ParkingEditor extends MarkingEditor
{
    constructor
    (
        viewport: Viewport,
        world: World
    )
    {
        super(viewport, world, world.laneGuides);
    }

    override createMarking(center: Point, directionVector: Point): Parking
    {
        return new Parking
        (
            center,
            directionVector,
            this.world.roadWidth / 2,
            this.world.roadWidth / 2
        );
    }
}