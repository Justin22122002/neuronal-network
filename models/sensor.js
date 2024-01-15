'use strict'

import { Drawable } from "../utils/drawable.js";
import {getIntersection, lerp} from "../utils/utils.js";
import { Car } from "./car.js";
import { TrafficObject } from "./trafficObject.js";

/**
 * @class
 * @classdesc
 * @implements {Drawable}
 */
export class Sensor
{
    /**
     * @constructor
     * @param {Car} car
     */
    constructor(car)
    {
        /** @member {Car} */
        this.car = car;
        /** @member {number} */
        this.rayCount = 5;
        /** @member {number} */
        this.rayLength = 150;
        /** @member {number} */
        this.raySpread = Math.PI / 2;

        /** @member {Coordinates[][]} */
        this.rays = [];

        /** @type {Coordinates[]} */
        this.readings = [];
    }

    /**
     * @public
     * @param {Coordinates[][]} roadBorders
     * @param {TrafficObject[]} traffic
     * @return {void}
     */
    update(roadBorders, traffic)
    {
        this.#castRays();
        this.readings = [];

        for(let i = 0; i < this.rays.length; i++)
        {
            this.readings.push
            (
                this.#getReading(this.rays[i], roadBorders, traffic)
            );
        }
    }

    /**
     * @param {Coordinates[]} ray
     * @param {Coordinates[][]} roadBorders
     * @param {TrafficObject[]} traffic
     * @return {Coordinates | null}
     */
    #getReading(ray, roadBorders, traffic)
    {
        /** @type {Coordinates[]} */
        let touches= [];

        for(let i= 0; i < roadBorders.length ;i++)
        {
            /** @type {Coordinates | null} */
            const touch = getIntersection
            (
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if(touch) touches.push(touch);
        }

        for (let i = 0; i < traffic.length; i++)
        {
            /** @type {Coordinates[]} */
            const poly = traffic[i].polygon;

            for (let j = 0; j < poly.length; j++)
            {
                /** @type {Coordinates | null} */
                const touch = getIntersection
                (
                    ray[0],
                    ray[1],
                    poly[i],
                    poly[(j + 1) % poly.length]
                );
                if(touch) touches.push(touch);
            }
        }

        if(touches.length === 0) return null;
        else
        {
            /** @type {(number | null)[]} */
            const offsets= touches.map(e => e.offset);
            if(!offsets) return null;
            /** @type {number} */
            const minOffset = Math.min(...offsets);
            return touches.find(e => e.offset === minOffset);
        }
    }

    /**
     * @return {void}
     */
    #castRays()
    {
        this.rays = [];
        for(let i= 0; i < this.rayCount ;i++)
        {
            /** @type {number} */
            const rayAngle= lerp
            (
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle;

            /** @type {Coordinates} */
            const start= { x: this.car.x, y: this.car.y, offset: null };
            /**@type {Coordinates} */
            const end=
            {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength,
                offset: null
            };
            this.rays.push([start, end]);
        }
    }

    /**
     * @public
     * @param {CanvasRenderingContext2D} ctx
     * @param {string | CanvasGradient | CanvasPattern} color
     * @return void
     */
    draw(ctx, color)
    {
        for(let i= 0; i < this.rayCount; i++)
        {
            /** @type {Coordinates} */
            let end = this.rays[i][1];
            if(this.readings[i]) end = this.readings[i];

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.moveTo
            (
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo
            (
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo
            (
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}