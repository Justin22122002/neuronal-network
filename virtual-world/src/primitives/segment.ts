import {Point} from "./point.ts";

export class Segment
{
    constructor(private _p1: Point, private _p2: Point)
    {
    }

    equals(seg: Segment): boolean
    {
        return this.includes(seg._p1) && this.includes(seg._p2);
    }

    includes(point: Point): boolean
    {
        return this._p1.equals(point) || this._p2.equals(point);
    }

    draw(ctx: CanvasRenderingContext2D, width: number = 2, color: string = "black"): void
    {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.moveTo(this._p1.x, this._p1.y);
        ctx.lineTo(this._p2.x, this._p2.y);
        ctx.stroke();
    }

    get p1(): Point
    {

        return this._p1;
    }

    set p1(value: Point)
    {
        this._p1 = value;
    }

    get p2(): Point
    {
        return this._p2;
    }

    set p2(value: Point)
    {
        this._p2 = value;
    }
}