'use strict'

import {lerp} from "./utils.js";
/**
 * @class
 * @implements {Drawable}
 */
export class Road
{
    /**
     * @constructor
     * @param {number} x
     * @param {number} width
     * @param {number} laneCount
     */
    constructor(x, width, laneCount = 3)
    {
        /** @member {number} */
        this.x = x;
        /** @member {number} */
        this.width = width;
        /** @member {number} */
        this.laneCount = laneCount;

        /** @member {number} */
        this.left = x - width / 2;
        /** @member {number} */
        this.right = x + width / 2;

        /** @type {number} */
        const infinity = 1_000_000;

        /** @member {number} */
        this.top = -infinity;
        /** @member {number} */
        this.bottom = infinity;

        /** @type {Coordinates} */
        const topLeft = {x: this.left, y: this.top};
        /** @type {Coordinates} */
        const topRight = {x: this.right, y: this.top};
        /** @type {Coordinates} */
        const bottomLeft = {x: this.left, y: this.bottom};
        /** @type {Coordinates} */
        const bottomRight = {x: this.right, y: this.bottom};

        /** @member {Coordinates[][]} */
        this.borders =
        [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    /**
     * laneIndex starts at 0
     * @public
     * @param {number} laneIndex
     * @return {number}
     */
    getLaneCenter(laneIndex)
    {
        const laneWidth = this.width / this.laneCount;
        return this.left + laneWidth / 2 +
            Math.min(laneIndex, this.laneCount - 1) * laneWidth;
    }

    /**
     * Draws the car on the canvas context.
     * @public
     * @override
     * @param {CanvasRenderingContext2D} ctx
     * @return void
     */
    draw(ctx)
    {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        for(let i = 1; i <= this.laneCount - 1; i++)
        {
            /** @type {number} */
            const x = lerp
            (
                this.left,
                this.right,
                i / this.laneCount
            );

            ctx.setLineDash([20,20]);
            ctx.beginPath();
            ctx.moveTo(x,this.top);
            ctx.lineTo(x,this.bottom);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        this.borders.forEach(border =>
        {
            ctx.beginPath();
            ctx.moveTo(border[0].x ,border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });
    }
}