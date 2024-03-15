import { Car } from "./car";
import { TrafficObject } from "./trafficObject";
import {Point} from "../primitives/point.ts";
import {getIntersection, lerp} from "../math/utils.ts";

export class Sensor
{
    public rayCount: number = 5;
    public rayLength: number = 150;
    public raySpread: number = Math.PI / 2;
    public rays: Point[][] = [];
    public readings: Point[] = [];

    constructor(public car: Car) {}

    /**
     * @param roadBorders
     * @param traffic
     * @return
     */
    update(roadBorders: Point[][], traffic: TrafficObject[]): void
    {
        this.castRays();
        this.readings = [];

        for (let i = 0; i < this.rays.length; i++)
        {
            this.readings.push(<Point>this.getReading(this.rays[i], roadBorders, traffic));
        }
    }

    /**
     * @param ray
     * @param roadBorders
     * @param traffic
     * @returns
     */
    private getReading(ray: Point[], roadBorders: Point[][], traffic: TrafficObject[]): Point | null
    {
        let touches: Point[] = [];

        for (let i = 0; i < roadBorders.length; i++)
        {
            const touch: Point | null = getIntersection
            (
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if (touch) touches.push(touch);
        }

        for (let i = 0; i < traffic.length; i++)
        {
            const poly: Point[] = traffic[i].polygon;

            for (let j = 0; j < poly.length; j++)
            {
                const touch: Point | null = getIntersection
                (
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length]
                );
                if (touch) touches.push(touch);
            }
        }

        if (touches.length === 0) return null;
        else
        {
            const offsets: (number | undefined)[] = touches.map((e: Point) => e.offset);

            if (offsets.includes(undefined))
            {
                return null;
            }

            const filteredOffsets: number[] = offsets.filter((offset: number | undefined): offset is number => offset !== null);

            if (!filteredOffsets.length)
            {
                return null;
            }

            const minOffset: number = Math.min(...filteredOffsets);

            return touches.find((e: Point): boolean => e.offset === minOffset) || null;
        }
    }

    /**
     * @return
     */
    private castRays(): void
    {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++)
        {
            const rayAngle: number =
                lerp
                (
                    this.raySpread / 2,
                    -this.raySpread / 2,
                    this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
                ) + this.car.angle;

            const start: Point = new Point(this.car.x, this.car.y);
            const end: Point = new Point
            (
                this.car.x - Math.sin(rayAngle) * this.rayLength,
                this.car.y - Math.cos(rayAngle) * this.rayLength,
            )

            this.rays.push([start, end]);
        }
    }

    /**
     * @param ctx
     * @returns
     */
    draw(ctx: CanvasRenderingContext2D): void
    {
        for (let i = 0; i < this.rayCount; i++)
        {
            let end: Point = this.rays[i][1];
            if (this.readings[i]) end = this.readings[i];

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }
}
