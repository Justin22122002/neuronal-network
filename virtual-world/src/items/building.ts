import {Polygon} from "../primitives/polygon.ts";
import {Point} from "../primitives/point.ts";
import {average, getFake3dPoint} from "../math/utils.ts";

export class Building
{
    constructor
    (
        private _base: Polygon,
        private readonly height = 200
    )
    {
    }

    draw(ctx: CanvasRenderingContext2D, viewPoint: Point): void
    {
        const topPoints: Point[] = this._base.points.map((p: Point) =>
            getFake3dPoint(p, viewPoint, this.height * 0.6)
        );
        const ceiling: Polygon = new Polygon(topPoints, []);

        const sides: Polygon[] = [];
        for (let i = 0; i < this._base.points.length; i++)
        {
            const nextI: number = (i + 1) % this._base.points.length;
            const poly: Polygon = new Polygon([
                this._base.points[i], this._base.points[nextI],
                topPoints[nextI], topPoints[i]
            ], []);
            sides.push(poly);
        }
        sides.sort(
            (a: Polygon, b: Polygon) =>
                b.distanceToPoint(viewPoint) -
                a.distanceToPoint(viewPoint)
        );

        const baseMidpoints: Point[] = [
            average(this._base.points[0], this._base.points[1]),
            average(this._base.points[2], this._base.points[3])
        ];

        const topMidpoints: Point[] = baseMidpoints.map((p: Point) =>
            getFake3dPoint(p, viewPoint, this.height)
        );

        const roofPolys: Polygon[] = [
            new Polygon([
                ceiling.points[0], ceiling.points[3],
                topMidpoints[1], topMidpoints[0]
            ], []),
            new Polygon([
                ceiling.points[2], ceiling.points[1],
                topMidpoints[0], topMidpoints[1]
            ], [])
        ];
        roofPolys.sort(
            (a: Polygon, b: Polygon) =>
                b.distanceToPoint(viewPoint) -
                a.distanceToPoint(viewPoint)
        );

        this._base.draw(ctx, { fill: "white", stroke: "rgba(0,0,0,0.2)", lineWidth: 20 });
        for (const side of sides) {
            side.draw(ctx, { fill: "white", stroke: "#AAA" });
        }
        ceiling.draw(ctx, { fill: "white", stroke: "white", lineWidth: 6 });
        for (const poly of roofPolys) {
            poly.draw(ctx, { fill: "#D44", stroke: "#C44", lineWidth: 8, join: "round" });
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
}