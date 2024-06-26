import {Marking} from "./marking.ts";
import {MarkingType} from "./markingType.ts";
import {Point} from "../primitives/point.ts";

export class Target extends Marking
{
    constructor
    (
        center: Point,
        directionVector: Point,
        width: number,
        height: number
    )
    {
        super(center, directionVector, width, height);
        this.type = MarkingType.TARGET;
    }

    draw(ctx: CanvasRenderingContext2D): void
    {
        this.center.draw(ctx, { color: "red", size: 30 });
        this.center.draw(ctx, { color: "white", size: 20 });
        this.center.draw(ctx, { color: "red", size: 10 });
    }
}