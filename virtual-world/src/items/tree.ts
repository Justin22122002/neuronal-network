import {getFake3dPoint, lerp, lerp2D, translate} from "../math/utils.ts";
import {Point} from "../primitives/point.ts";
import {Polygon} from "../primitives/polygon.ts";

export class Tree
{
    private _base: Polygon;

    constructor
    (
        private _center: Point,
        private readonly size: number,
        private readonly height = 200)
    {
        this.size = size; // size of the base
        this.height = height;
        this._base = this.generateLevel(_center, size);
    }

    private generateLevel(point: Point, size: number): Polygon
    {
        const points: Point[] = [];
        const rad: number = size / 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 16)
        {
            const kindOfRandom = Math.cos(((a + this._center.x) * size) % 17) ** 2;
            const noisyRadius = rad * lerp(0.5, 1, kindOfRandom);
            points.push(translate(point, a, noisyRadius));
        }
        return new Polygon(points, []);
    }

    draw(ctx: CanvasRenderingContext2D, viewPoint: Point): void
    {
        const top: Point = getFake3dPoint(this._center, viewPoint, this.height);

        const levelCount = 7;
        for (let level = 0; level < levelCount; level++)
        {
            const t: number = level / (levelCount - 1);
            const point: Point = lerp2D(this._center, top, t);
            const color: string = "rgb(30," + lerp(50, 200, t) + ",70)";
            const size: number = lerp(this.size, 40, t);
            const poly: Polygon = this.generateLevel(point, size);
            poly.draw(ctx, { fill: color, stroke: "rgba(0,0,0,0)" });
        }
    }


    get base(): Polygon
    {
        return this._base;
    }

    set base(value: Polygon)
    {
        this._base = value;
    }


    get center(): Point
    {
        return this._center;
    }

    set center(value: Point)
    {
        this._center = value;
    }
}