'use strict'

/**
 * @typedef {Object} Coordinates
 * @property {number} x - x-coordinate.
 * @property {number} y - y-coordinate.
 * @property {number?} offset - offset.
 */

/**
 * linear interpolation
 * @param {number} A
 * @param {number} B
 * @param {number} t
 * @return {number}
 */
export function lerp(A, B, t)
{
    return A + (B - A) * t;
}

/**
 *
 * @param {Coordinates} A
 * @param {Coordinates} B
 * @param {Coordinates} C
 * @param {Coordinates} D
 * @return {Coordinates | null}
 */
export function getIntersection(A,B,C,D)
{
    /** @type {number} */
    const tTop= (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    /** @type {number} */
    const uTop= (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    /** @type {number} */
    const bottom= (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if(bottom!==0)
    {
        /** @type {number} */
        const t= tTop / bottom;
        /** @type {number} */
        const u= uTop / bottom;

        if(t >= 0 && t <= 1 && u >= 0 && u <= 1)
        {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset:t
            }
        }
    }

    return null;
}