'use strict'

import { Controls } from "./controls.js";
import { Sensor } from "./sensor.js";
import { polysIntersect } from "../utils/utils.js";
import { TrafficObject } from "./trafficObject.js";
import { Drawable } from "../utils/drawable.js";
import { NeuralNetwork } from "../neural-network/neural-network.js";
import { ControlType } from "./coordinates.js";

/**
 * @class
 * @classdesc Represents a car object with position and dimensions.
 * @implements {Drawable}
 */
export class Car extends TrafficObject
{
    /**
     * @constructor
     * @param {number} x - The x-coordinate of the car.
     * @param {number} y - The y-coordinate of the car.
     * @param {number} width - The width of the car.
     * @param {number} height - The height of the car.
     * @param {ControlType} controlType - controlType of the car
     * @param {number} maxSpeed - maxSpeed of the car
     * @param {string} color
     */
    constructor(x, y, width, height, controlType, maxSpeed = 3, color = "blue")
    {
        super();
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
        this.maxSpeed = maxSpeed;
        /** @member {number} */
        this.friction = 0.05;
        /** @member {number} */
        this.angle = 0;
        /** @type {boolean} */
        this.damaged = false;

        /** @member {boolean} */
        this.useBrain = controlType === ControlType.AI;
        /** @member {Controls} */
        this.controls = new Controls(controlType);

        if (controlType !== ControlType.DUMMY) 
        {
            /** @member {Sensor} */
            this.sensor = new Sensor(this);
            /** @member {NeuralNetwork} */
            this.brain = new NeuralNetwork
            (
                [this.sensor.rayCount, 6, 4] // 6 = hidden layer, 4 = output Layer --> Left Right Forward Reverse
            );
        }

        /** @member {HTMLImageElement} */
        this.img = new Image();
        this.img.src = "./assets/car.png"

        this.mask = document.createElement("canvas");
        this.mask.width = width;
        this.mask.height = height;

        const maskCtx = this.mask.getContext("2d");
        this.img.onload = () => 
        {
            maskCtx.fillStyle = color;
            maskCtx.rect(0, 0, this.width, this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        }
    }

    /**
     * @public
     * @param {Coordinates[][]} roadBorders
     * @param {TrafficObject[]} traffic
     * @return {void}
     */
    update(roadBorders, traffic)
    {
        if(!this.damaged)
        {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }

        if (this.sensor) 
        {
            this.sensor.update(roadBorders, traffic);

            /** @type {number[]} */
            const offsets = this.sensor.readings.map
            (
                s => s === null ? 0 : 1 - s.offset
            );

            /** @type {number[]} */
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if(this.useBrain)
            {
                this.controls.forward = outputs[0] === 1;
                this.controls.left = outputs[1] === 1;
                this.controls.right = outputs[2] === 1;
                this.controls.reverse = outputs[3] === 1;
            }
        }
    }

    /**
     * checks if the given coordinates intersect with the car points
     * @param {Coordinates[][]} roadBorders
     * @param {TrafficObject[]} traffic
     * @return {boolean}
     */
    #assessDamage(roadBorders, traffic)
    {
        for(let i= 0; i < roadBorders.length; i++)
        {
            if(polysIntersect(this.polygon, roadBorders[i])) return true;
        }

        for(let i= 0; i < traffic.length; i++)
        {
            if(polysIntersect(this.polygon, traffic[i].polygon)) return true;
        }
        return false;
    }

    /**
     * @return {Coordinates[]}
     */
    #createPolygon()
    {
        /** @type {Coordinates[]} */
        const points = [];
        /** @type {number} */
        const rad = Math.hypot(this.width, this.height) / 2;
        /** @type {number} */
        const alpha = Math.atan2(this.width, this.height);

        points.push
        ({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad,
            offset: null
        });

        points.push
        ({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad,
            offset: null
        });

        points.push
        ({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
            offset: null
        });

        points.push
        ({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
            offset: null
        });

        return points;
    }

    /**
     * @return {void}
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
     * @param {boolean} drawSensor
     * @return {void}
     */
    draw(ctx, drawSensor = false)
    {
        if(this.sensor && drawSensor)
        {
            this.sensor.draw(ctx);
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        if(!this.damaged)
        {
            ctx.drawImage
            (   
                this.mask,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            ctx.globalCompositeOperation = "multiply";
        }

        ctx.drawImage
        (
            this.img,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        ctx.restore();

        /**
            if(this.damaged) ctx.fillStyle = "gray";
            else ctx.fillStyle = color;
            
            ctx.beginPath();
            ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
            
            for(let i = 1; i < this.polygon.length; i++)
            {
                ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
            }

            ctx.fill();

            if (this.sensor && drawSensor) this.sensor.draw(ctx, "yellow");
         */
    }
}