import {Coordinates} from "../models/coordinates.ts";

/**
 * Linear interpolation
 * @param A
 * @param B
 * @param t
 * @returns
 */
export function lerp(A: number, B: number, t: number): number
{
    return A + (B - A) * t;
}

/**
 * Checks for an intersection
 * @param A
 * @param B
 * @param C
 * @param D
 * @returns
 */
export function getIntersection(A: Coordinates, B: Coordinates, C: Coordinates, D: Coordinates): Coordinates | null
{
    const tTop: number = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop: number = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom: number = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if (bottom !== 0)
    {
        const t: number = tTop / bottom;
        const u: number = uTop / bottom;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1)
        {
            return{
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t,
            };
        }
    }

    return null;
}

/**
 * Checks for an intersection between the given coordinates
 * @param poly1
 * @param poly2
 * @returns
 */
export function polysIntersect(poly1: Coordinates[], poly2: Coordinates[]): boolean
{
    for (let i: number = 0; i < poly1.length; i++)
    {
        for (let j: number = 0; j < poly2.length; j++)
        {
            const touch: Coordinates | null = getIntersection
            (
                poly1[i],
                poly1[(i + 1) % poly1.length],
                poly2[j],
                poly2[(j + 1) % poly2.length]
            );

            if (touch) return true;
        }
    }

    return false;
}

/**
 * @param value
 * @returns
 */
export function getRGBA(value: number): string
{
    const alpha: number = Math.abs(value);
    const R: 0 |255 = value < 0 ? 0 : 255;
    const G: 0 |255 = R;
    const B: 0 |255 = value > 0 ? 0 : 255;
    return "rgba("+R+","+G+","+B+","+alpha+")";
}

/**
 * @returns
 */
export function getRandomColor(): string
{
    const hue: number = 290 + Math.random() * 260;
    return "hsl("+hue+", 100%, 60%)";
}