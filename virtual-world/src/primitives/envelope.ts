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

        const radius = width / 2;
        const alpha = angle(subtract(p1, p2));
        const alpha_cw = alpha + Math.PI / 2;
        const alpha_ccw = alpha - Math.PI / 2;

        const points = [];
        const step = Math.PI / Math.max(1, roundness);
        const eps = step / 2;
        for (let i = alpha_ccw; i <= alpha_cw + eps; i += step)
        {
            points.push(translate(p1, i, radius));
        }
        for (let i = alpha_ccw; i <= alpha_cw + eps; i += step)
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