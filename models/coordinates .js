// @ts-check
'use strict'

/**
 * @class
 * @classdesc Represents a set of coordinates.
 */
class Coordinates 
{
    /**
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {number?} offset - The offset.
     */
    constructor(x, y, offset) 
    {
        /** @member {number} */
        this.x = x;
        /** @member {number} */
        this.y = y;
        /** @member {number?} */
        this.offset = offset;
    }
}

/**
 * @enum {string}
 * @readonly
 * @description Represents the control types.
 */
const ControlType = 
{
    KEYS: 'KEYS',
    DUMMY: 'DUMMY',
};
