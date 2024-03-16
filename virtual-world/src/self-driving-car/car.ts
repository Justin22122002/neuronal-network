import { Controls } from "./controls.ts";
import { Sensor } from "./sensor";
import { TrafficObject } from "./trafficObject";
import {ControlType} from "./enums/controlType.ts";
import {NeuralNetwork} from "./neural-network/neural-network.ts";
import {Point} from "../primitives/point.ts";
import {polysIntersect} from "../math/utils.ts";

/**
 * Represents a car object with position and dimensions.
 */
export class Car extends TrafficObject
{
    public speed: number;
    public acceleration: number;
    public friction: number;
    public damaged: boolean;
    public useBrain: boolean;
    public controls: Controls;
    public sensor?: Sensor;
    public brain?: NeuralNetwork;
    public img: HTMLImageElement;
    public mask: HTMLCanvasElement;
    public fittness = 0;

    /**
     * Constructor for Car.
     * @param x - The x-coordinate of the car.
     * @param y - The y-coordinate of the car.
     * @param width - The width of the car.
     * @param height - The height of the car.
     * @param controlType - Type of controls for the car.
     * @param angle - Angle of the car
     * @param maxSpeed - Maximum speed of the car.
     * @param color - Color of the car.
     */
    constructor
    (
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        controlType: ControlType,
        public angle: number,
        public maxSpeed: number = 3,
        color: string = "blue"
    )
    {
        super();
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType === ControlType.AI;
        this.controls = new Controls(controlType);

        if (controlType !== ControlType.DUMMY)
        {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 6, 4]);
        }

        this.img = new Image();
        this.img.src = "./src/car.png";

        this.mask = document.createElement("canvas");
        this.mask.width = width;
        this.mask.height = height;

        const maskCtx: CanvasRenderingContext2D | null = this.mask.getContext("2d");
        if(!maskCtx) return;
        this.img.onload = () =>
        {
            maskCtx.fillStyle = color;
            maskCtx.rect(0, 0, this.width, this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        };
    }

    /**
     * Update method for the car.
     * @param roadBorders - Array of road borders.
     * @param traffic - Array of traffic objects.
     */
    update(roadBorders: Point[][], traffic: TrafficObject[]): void
    {
        if (!this.damaged)
        {
            this.move();
            this.fittness += this.speed;
            this.polygon = this.createPolygon();
            this.damaged = this.assessDamage(roadBorders, traffic);
        }

        if (this.sensor)
        {
            this.sensor.update(roadBorders, traffic);

            const offsets: number[] = this.sensor.readings.map((s: Point): number => s === null ? 0 : 1 - (s.offset ?? 0));

            if(!this.brain) return;

            const outputs: number[] = NeuralNetwork.feedForward(offsets, this.brain);

            if (this.useBrain)
            {
                this.controls.forward = outputs[0] === 1;
                this.controls.left = outputs[1] === 1;
                this.controls.right = outputs[2] === 1;
                this.controls.reverse = outputs[3] === 1;
            }
        }
    }

    /**
     * Assess the damage of the car.
     * @param roadBorders - Array of road borders.
     * @param traffic - Array of traffic objects.
     * @returns Whether the car is damaged or not.
     */
    private assessDamage(roadBorders: Point[][], traffic: TrafficObject[]): boolean
    {
        for (let i = 0; i < roadBorders.length; i++)
        {
            if (polysIntersect(this.polygon, roadBorders[i])) return true;
        }

        for (let i = 0; i < traffic.length; i++)
        {
            if (polysIntersect(this.polygon, traffic[i].polygon)) return true;
        }
        return false;
    }

    /**
     * Create the polygon of the car.
     * @returns Array of coordinates representing the car's polygon.
     */
    private createPolygon(): Point[]
    {
        const points: Point[] = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);

        points.push
        (new Point(
            this.x - Math.sin(this.angle - alpha) * rad,
            this.y - Math.cos(this.angle - alpha) * rad,
        ));

        points.push
        (new Point(
            this.x - Math.sin(this.angle + alpha) * rad,
            this.y - Math.cos(this.angle + alpha) * rad,
        ));

        points.push
        (new Point(
            this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
        ));

        points.push
        (new Point(
            this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
        ));

        return points;
    }

    /**
     * Move the car based on controls.
     */
    private move(): void
    {
        if(this.controls.forward)
        {
            this.speed += this.acceleration;
        }
        if(this.controls.reverse)
        {
            this.speed -= this.acceleration;
        }

        if(this.speed > this.maxSpeed)
        {
            this.speed = this.maxSpeed;
        }
        if(this.speed <- this.maxSpeed/2)
        {
            this.speed =- this.maxSpeed/2;
        }

        if(this.speed > 0)
        {
            this.speed -= this.friction;
        }
        if(this.speed < 0)
        {
            this.speed += this.friction;
        }

        if(Math.abs(this.speed) < this.friction)
        {
            this.speed = 0;
        }

        if (this.speed !== 0)
        {
            const flip = this.speed > 0 ? 1 : -1;

            if (this.controls.left) this.angle += 0.03 * flip;
            if (this.controls.right) this.angle -= 0.03 * flip;
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    /**
     * Draw the car on the canvas context.
     * @param ctx - Canvas rendering context.
     * @param drawSensor - Whether to draw the sensor or not.
     */
    draw(ctx: CanvasRenderingContext2D, drawSensor: boolean = false): void
    {
        if (this.sensor && drawSensor)
        {
            this.sensor.draw(ctx);
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);

        if (!this.damaged)
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
    }
}
