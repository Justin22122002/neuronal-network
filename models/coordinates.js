'use strict'

/**
 * @class
 * @classdesc Represents a set of coordinates.
 */
export class Coordinates
{
    /**
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {number | null} offset - The offset.
     */
    constructor(x, y, offset) 
    {
        /** @member {number} */
        this.x = x;
        /** @member {number} */
        this.y = y;
        /** @member {number | null} */
        this.offset = offset;
    }
}

/**
 * @enum {string}
 * @readonly
 * @description Represents the control types.
 */
export const ControlType =
{
    KEYS: 'KEYS',
    DUMMY: 'DUMMY',
};
