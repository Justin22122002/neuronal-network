import {Polygon} from "./polygon.ts";
import {angle, subtract, translate} from "../math/utils.ts";
import {Point} from "./point.ts";

export class Envelope
{
    private _poly: Polygon;
    constructor
    (
        private _skeleton: { p1: Point, p2: Point },
        width: number,
        roundness = 1
    )
    {
        this._poly = this.generatePolygon(width, roundness);
    }

    private generatePolygon(width: number, roundness: number): Polygon
    {
        const { p1, p2 } = this._skeleton;

        const radius: number = width / 2;
        const alpha: number = angle(subtract(p1, p2));
        const alpha_cw: number = alpha + Math.PI / 2;
        const alpha_ccw: number = alpha - Math.PI / 2;

        const points: Point[] = [];
        const step: number = Math.PI / Math.max(1, roundness);
        const eps: number = step / 2;
        for (let i: number = alpha_ccw; i <= alpha_cw + eps; i += step)
        {
            points.push(translate(p1, i, radius));
        }
        for (let i: number = alpha_ccw; i <= alpha_cw + eps; i += step)
        {
            points.push(translate(p2, Math.PI + i, radius));
        }

        return new Polygon(points, []);
    }

    draw(ctx: CanvasRenderingContext2D, options: any): void
    {
        this._poly.draw(ctx, options);
    }


    get poly(): Polygon
    {
        return this._poly;
    }

    set poly(value: Polygon)
    {
        this._poly = value;
    }


    get skeleton(): { p1: Point; p2: Point }
    {
        return this._skeleton;
    }

    set skeleton(value: { p1: Point; p2: Point })
    {
        this._skeleton = value;
    }
}