import {Point} from "./point.ts";
import {add, distance, dot, magnitude, normalize, scale, subtract} from "../math/utils.ts";

export class Segment
{
    constructor(private _p1: Point, private _p2: Point)
    {
    }

    length()
    {
        return distance(this.p1, this.p2);
    }

    directionVector(): Point
    {
        return normalize(subtract(this.p2, this.p1));
    }

    equals(seg: Segment): boolean
    {
        return this.includes(seg._p1) && this.includes(seg._p2);
    }

    includes(point: Point): boolean
    {
        return this._p1.equals(point) || this._p2.equals(point);
    }

    distanceToPoint(point: Point): number
    {
        const proj: Point = this.projectPoint(point);
        if(proj.offset)
        {
            if (proj.offset > 0 && proj.offset < 1)
            {
                return distance(point, proj);
            }
        }
        const distToP1: number = distance(point, this.p1);
        const distToP2: number = distance(point, this.p2);
        return Math.min(distToP1, distToP2);
    }

    projectPoint(point: Point): Point
    {
        const a: Point = subtract(point, this.p1);
        const b: Point = subtract(this.p2, this.p1);
        const normB: Point = normalize(b);
        const scaler: number = dot(a, normB);
        const proj: Point = add(this.p1, scale(normB, scaler));
        proj.offset = scaler / magnitude(b);
        return proj;
    }

    draw(ctx: CanvasRenderingContext2D, { width = 2, color = "black", dash = [] as number[] } = {}): void
    {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.setLineDash(dash);
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
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