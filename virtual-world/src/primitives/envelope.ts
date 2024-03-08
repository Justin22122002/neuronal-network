import {Polygon} from "./polygon.ts";
import {angle, subtract, translate} from "../math/utils.ts";
import {Point} from "./point.ts";
import {Segment} from "./segment.ts";

export class Envelope
{
    public poly: Polygon;
    constructor
    (
        public skeleton: { p1: Point, p2: Point },
        width: number,
        roundness: number = 1
    )
    {
        this.poly = this.generatePolygon(width, roundness);
    }

    static load(info: Envelope): Envelope
    {
        const env = new Envelope({ p1: new Point(0, 0), p2: new Point(10, 10) }, 5, 1);
        env.skeleton = new Segment(info.skeleton.p1, info.skeleton.p2);
        env.poly = Polygon.load(info.poly);
        return env;
    }

    private generatePolygon(width: number, roundness: number): Polygon
    {
        const { p1, p2 } = this.skeleton;

        const radius: number = width / 2;
        const alpha: number = angle(subtract(p1, p2));
        const alpha_cw: number = alpha + Math.PI / 2;
        const alphac_cw: number = alpha - Math.PI / 2;

        const points: Point[] = [];
        const step: number = Math.PI / Math.max(1, roundness);
        const eps: number = step / 2;
        for (let i: number = alphac_cw; i <= alpha_cw + eps; i += step)
        {
            points.push(translate(p1, i, radius));
        }
        for (let i: number = alphac_cw; i <= alpha_cw + eps; i += step)
        {
            points.push(translate(p2, Math.PI + i, radius));
        }

        return new Polygon(points, []);
    }

    draw(ctx: CanvasRenderingContext2D, options: any): void
    {
        this.poly.draw(ctx, options);
    }
}