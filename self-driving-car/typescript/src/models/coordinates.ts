'use strict';

/**
 * Represents a set of coordinates.
 */
export class Coordinates
{
    constructor
    (
        public x: number,
        public y: number,
        public offset: number | null
    ) {}
}
