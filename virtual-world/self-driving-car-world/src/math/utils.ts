import {Point} from "../primitives/point.ts";
import {Segment} from "../primitives/segment.ts";

export function getNearestPoint(loc: Point, points: Point[], threshold: number = Number.MAX_SAFE_INTEGER): Point | null
{
    let minDist: number = Number.MAX_SAFE_INTEGER;
    let nearest = null;
    for (const point of points)
    {
        const dist = distance(point, loc);
        if (dist < minDist && dist < threshold)
        {
            minDist = dist;
            nearest = point;
        }
    }
    return nearest;
}

export function getNearestSegment(loc: Point, segments: Segment[], threshold = Number.MAX_SAFE_INTEGER): Segment | null
{
    let minDist = Number.MAX_SAFE_INTEGER;
    let nearest = null;
    for (const seg of segments)
    {
        const dist = seg.distanceToPoint(loc);
        if (dist < minDist && dist < threshold)
        {
            minDist = dist;
            nearest = seg;
        }
    }
    return nearest;
}

export function distance(p1: Point, p2: Point): number
{
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function average(p1: Point, p2: Point): Point
{
    return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
}

export function dot(p1: Point, p2: Point): number
{
    return p1.x * p2.x + p1.y * p2.y;
}

export function add(point1: Point, point2: Point): Point
{
    return new Point(point1.x + point2.x, point1.y + point2.y);
}

export function subtract(point1: Point, point2: Point): Point
{
    return new Point(point1.x - point2.x, point1.y - point2.y);
}

export function scale(p: Point, scaler: number)
{
    return new Point(p.x * scaler, p.y * scaler);
}

export function normalize(p: Point): Point
{
    return scale(p, 1 / magnitude(p));
}

export function magnitude(p: Point): number
{
    return Math.hypot(p.x, p.y);
}

export function perpendicular(p: Point): Point
{
    return new Point(-p.y, p.x);
}

export function translate(loc: Point, angle: number, offset: number): Point
{
    return new Point
    (
        loc.x + Math.cos(angle) * offset,
        loc.y + Math.sin(angle) * offset
    );
}

export function angle(p: Point): number
{
    return Math.atan2(p.y, p.x);
}

export function getIntersection(A: Point, B: Point, C: Point, D: Point): Point | null
{
    const tTop: number = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop: number = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom: number = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    const eps = 0.001;
    if (Math.abs(bottom) > eps)
    {
        const t: number = tTop / bottom;
        const u: number = uTop / bottom;
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1)
        {
            let point = new Point
            (
                lerp(A.x, B.x, t),
                lerp(A.y, B.y, t)
            )
            point.offset = t;
            return point;
        }
    }

    return null;
}

export function lerp(a: number, b: number, t: number): number
{
    return a + (b - a) * t;
}

export function lerp2D(A: Point, B: Point, t: number): Point
{
    return new Point(lerp(A.x, B.x, t), lerp(A.y, B.y, t));
}

export function getRandomColor(): string
{
    const hue: number = 290 + Math.random() * 260;
    return "hsl(" + hue + ", 100%, 60%)";
}

export function getFake3dPoint(point: Point, viewPoint: Point, height: number): Point
{
    const dir: Point = normalize(subtract(point, viewPoint));
    const dist: number = distance(point, viewPoint);
    const scaler: number = Math.atan(dist / 300) / (Math.PI / 2);
    return add(point, scale(dir, height * scaler));
}