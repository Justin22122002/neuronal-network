import {Marking} from "./marking.ts";
import {angle} from "../math/utils.ts";
import {Point} from "../primitives/point.ts";
import {Segment} from "../primitives/segment.ts";

export class Parking extends Marking
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
        for (const border of this._borders)
        {
            border.draw(ctx, { width: 5, color: "white" });
        }
        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(angle(this.directionVector));

        ctx.beginPath();
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "bold " + this.height * 0.9 + "px Arial";
        ctx.fillText("P", 0, 3);

        ctx.restore();
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