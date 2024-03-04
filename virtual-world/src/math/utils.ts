import {Point} from "../primitives/point.ts";

export function getNearestPoint(target: Point, points: Point[], threshold: number = Number.MAX_SAFE_INTEGER): Point | null
{
    let minDist = Number.MAX_SAFE_INTEGER;
    let nearest = null;
    for (const point of points)
    {
        const dist = distance(point, target);
        if (dist < minDist && dist < threshold)
        {
            minDist = dist;
            nearest = point;
        }
    }
    return nearest;
}

export function distance(p1: Point, p2: Point): number
{
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function scale(point: Point, factor: number): Point
{
    return new Point(point.x * factor, point.y * factor);
}

export function add(point1: Point, point2: Point): Point
{
    return new Point(point1.x + point2.x, point1.y + point2.y);
}

export function subtract(point1: Point, point2: Point): Point
{
    return new Point(point1.x - point2.x, point1.y - point2.y);
}