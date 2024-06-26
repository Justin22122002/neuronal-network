'use strict'

/**
 * @interface
 * @abstract
 * @classdesc
 */
export class Drawable
{
    /**
     * draws the Object on the canvas
     * @public
     * @abstract
     * @param {CanvasRenderingContext2D} ctx - canvas.
     * @return {void}
     */
    draw(ctx) {}
}