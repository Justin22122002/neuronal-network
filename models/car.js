'use strict'

import {Controls} from "./controls.js";

/**
 * Represents a car object with position and dimensions.
 * @class
 */
export class Car
{
    /**
     * @constructor
     * @param {number} x - The x-coordinate of the car.
     * @param {number} y - The y-coordinate of the car.
     * @param {number} width - The width of the car.
     * @param {number} height - The height of the car.
     */
    constructor(x, y, width, height)
    {
        /** @member {number} */
        this.x = x;
        /** @member {number} */
        this.y = y;
        /** @member {number} */
        this.width = width;
        /** @member {number} */
        this.height = height;
        /** @member {number} */
        this.speed = 0;
        /** @member {number} */
        this.acceleration = 0.2;
        /** @member {number}*/
        this.maxSpeed = 3;
        /** @member {number} */
        this.friction = 0.05;
        /** @member {number} */
        this.angle = 0;
        /** @member {Controls} */
        this.controls = new Controls();
    }

    /**
     * @public
     * @returns {void}
     */
    update()
    {
        this.#move();
    }

    /**
     * @private
     * @returns {void}
     */
    #move()
    {
        if(this.controls.forward) this.speed += this.acceleration;
        if(this.controls.reverse) this.speed -= this.acceleration;

        if(this.speed > this.maxSpeed) this.speed = this.maxSpeed;
        if(this.speed < -this.maxSpeed / 2) this.speed =- this.maxSpeed / 2;

        if(this.speed > 0) this.speed -= this.friction;
        if(this.speed < 0) this.speed += this.friction;
        if(Math.abs(this.speed) < this.friction) this.speed = 0;

        if(this.speed !== 0)
        {
            /** @type {number} */
            const flip=this.speed > 0 ? 1 : -1;

            if(this.controls.left) this.angle += 0.03 * flip;
            if(this.controls.right) this.angle -= 0.03 * flip;
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    /**
     * Draws the car on the canvas context.
     * @public
     * @param {CanvasRenderingContext2D} ctx
     * @returns void
     */
    draw(ctx)
    {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);

        ctx.beginPath();
        ctx.rect
        (
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.fill();

        ctx.restore();
    }
}