import {Point} from "../primitives/point.ts";
import {Segment} from "../primitives/segment.ts";
import {angle, translate} from "../math/utils.ts";
import {Envelope} from "../primitives/envelope.ts";
import {Polygon} from "../primitives/polygon.ts";

export abstract class Marking
{
    private _support: Segment;
    private _poly: Polygon;
    protected constructor
    (
        protected _center: Point,
        protected _directionVector: Point,
        protected width: number,
        protected height: number
    )
    {
        this._support = new Segment(
            translate(_center, angle(_directionVector), height / 2),
            translate(_center, angle(_directionVector), -height / 2)
        );
        this._poly = new Envelope(this._support, width, 0).poly;
    }

    draw(ctx: CanvasRenderingContext2D): void
    {
        this._poly.draw(ctx);
    }


    get support(): Segment
    {
        return this._support;
    }

    set support(value: Segment)
    {
        this._support = value;
    }

    get poly(): Polygon
    {
        return this._poly;
    }

    set poly(value: Polygon)
    {
        this._poly = value;
    }

    get center(): Point
    {
        return this._center;
    }

    set center(value: Point)
    {
        this._center = value;
    }

    get directionVector(): Point
    {
        return this._directionVector;
    }

    set directionVector(value: Point)
    {
        this._directionVector = value;
    }
}