import {Point} from "../primitives/point.ts";
import {Segment} from "../primitives/segment.ts";

export class Graph
{
    constructor
    (
        private _points: Point[] = [],
        private _segments: Segment[] = []
    ) {}

    toJSON(): string
    {
        return JSON.stringify({
            points: this._points.map((p) => ({x: p.x, y: p.y})),
            segments: this._segments.map((s) => ({p1: {x: s.p1.x, y: s.p1.y}, p2: {x: s.p2.x, y: s.p2.y}}))
        });
    }

    static load(info: Graph): Graph
    {
        console.log(info)
        const points = info.points.map((i) => new Point(i.x, i.y));

        const segments = info.segments.map((i) => new Segment(
            points.find((p) => p.equals(i.p1))!,
            points.find((p) => p.equals(i.p2))!
        ));

        return new Graph(points, segments);
    }

    addPoint(point: Point): void
    {
        this._points.push(point);
    }

    containsPoint(point: Point): Point | undefined
    {
        return this._points.find((p) => p.equals(point));
    }

    tryAddPoint(point: Point): boolean
    {
        if (!this.containsPoint(point))
        {
            this.addPoint(point);
            return true;
        }
        return false;
    }

    removePoint(point: Point): void
    {
        const segs: Segment[] = this.getSegmentsWithPoint(point);
        for (const seg of segs)
        {
            this.removeSegment(seg);
        }
        this._points.splice(this._points.indexOf(point), 1);
    }

    addSegment(seg: Segment): void
    {
        this._segments.push(seg);
    }

    containsSegment(seg: Segment): Segment | undefined
    {
        return this._segments.find((s) => s.equals(seg));
    }

    tryAddSegment(seg: Segment): boolean
    {
        if (!this.containsSegment(seg) && !seg.p1.equals(seg.p2))
        {
            this.addSegment(seg);
            return true;
        }
        return false;
    }

    removeSegment(seg: Segment): void
    {
        this._segments.splice(this._segments.indexOf(seg), 1);
    }

    getSegmentsWithPoint(point: Point): Segment[]
    {
        const segs: Segment[] = [];
        for (const seg of this._segments)
        {
            if (seg.includes(point))
            {
                segs.push(seg);
            }
        }
        return segs;
    }

    dispose(): void
    {
        this._points.length = 0;
        this._segments.length = 0;
    }

    draw(ctx: CanvasRenderingContext2D): void
    {
        for (const seg of this._segments)
        {
            seg.draw(ctx);
        }

        for (const point of this._points)
        {
            point.draw(ctx);
        }
    }


    get points(): Point[]
    {
        return this._points;
    }

    set points(value: Point[])
    {
        this._points = value;
    }

    get segments(): Segment[]
    {
        return this._segments;
    }

    set segments(value: Segment[])
    {
        this._segments = value;
    }
}