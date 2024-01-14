'use strict'

/**
 * @interface
 * @abstract
 */
export class Drawable
{
    /**
     * draws the Object on the canvas
     * @public
     * @abstract
     * @param {CanvasRenderingContext2D} ctx - canvas.
     * @param {string | CanvasGradient | CanvasPattern} color
     * @return {void}
     */
    draw(ctx, color) {}
}