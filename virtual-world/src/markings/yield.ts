import {Point} from "../primitives/point.ts";
import {Marking} from "./marking.ts";
import {angle} from "../math/utils.ts";
import {Segment} from "../primitives/segment.ts";

export class Yield extends Marking
{
    private _border: Segment;
    constructor
    (
        center: Point,
        directionVector: Point,
        width: number,
        height: number
    )
    {
        super(center, directionVector, width, height);

        this._border = this.poly.segments[2];
    }

    draw(ctx: CanvasRenderingContext2D): void
    {
        this._border.draw(ctx, { width: 5, color: "white" });
        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(angle(this.directionVector) - Math.PI / 2);
        ctx.scale(1, 3);

        ctx.beginPath();
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.font = "bold " + this.height * 0.3 + "px Arial";
        ctx.fillText("YIELD", 0, 1);

        ctx.restore();
    }


    get border(): Segment
    {
        return this._border;
    }

    set border(value: Segment)
    {
        this._border = value;
    }
}