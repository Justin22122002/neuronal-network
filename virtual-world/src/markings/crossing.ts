import {Marking} from "./marking.ts";
import {Segment} from "../primitives/segment.ts";
import {add, perpendicular, scale} from "../math/utils.ts";
import {Point} from "../primitives/point.ts";

export class Crossing extends Marking
{
    private _borders: Segment[];

    constructor
    (
        center: Point,
        directionVector: Point,
        width: number,
        height: number
    )
    {
        super(center, directionVector, width, height);

        this._borders = [this.poly.segments[0], this.poly.segments[2]];
    }

    draw(ctx: CanvasRenderingContext2D): void
    {
        const perp: Point = perpendicular(this.directionVector);
        const line = new Segment(
            add(this.center, scale(perp, this.width / 2)),
            add(this.center, scale(perp, -this.width / 2))
        );
        line.draw(ctx,
        {
            width: this.height,
            color: "white",
            dash: [11, 11]
        });
    }

    get borders(): Segment[]
    {
        return this._borders;
    }

    set borders(value: Segment[])
    {
        this._borders = value;
    }
}