import { getIntersection, lerp } from "../utils/utils";
import { Car } from "./car";
import { TrafficObject } from "./trafficObject";
import {Coordinates} from "./coordinates.ts";

export class Sensor
{
    public rayCount: number = 5;
    public rayLength: number = 150;
    public raySpread: number = Math.PI / 2;
    public rays: Coordinates[][] = [];
    public readings: Coordinates[] = [];

    constructor(public car: Car) {}

    /**
     * @param roadBorders
     * @param traffic
     * @return
     */
    update(roadBorders: Coordinates[][], traffic: TrafficObject[]): void
    {
        this.castRays();
        this.readings = [];

        for (let i = 0; i < this.rays.length; i++)
        {
            this.readings.push(<Coordinates>this.getReading(this.rays[i], roadBorders, traffic));
        }
    }

    /**
     * @param ray
     * @param roadBorders
     * @param traffic
     * @return
     */
    private getReading(ray: Coordinates[], roadBorders: Coordinates[][], traffic: TrafficObject[]): Coordinates | null
    {
        let touches: Coordinates[] = [];

        for (let i = 0; i < roadBorders.length; i++)
        {
            const touch: Coordinates | null = getIntersection
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
            const poly: Coordinates[] = traffic[i].polygon;

            for (let j = 0; j < poly.length; j++)
            {
                const touch: Coordinates | null = getIntersection
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
            const offsets: (number | null)[] = touches.map((e: Coordinates) => e.offset);

            if (offsets.includes(null))
            {
                return null;
            }

            const filteredOffsets: number[] = offsets.filter((offset: number | null): offset is number => offset !== null);

            if (!filteredOffsets.length)
            {
                return null;
            }

            const minOffset: number = Math.min(...filteredOffsets);

            return touches.find((e: Coordinates): boolean => e.offset === minOffset) || null;
        }
    }

    /**
     * @return {void}
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

            const start: Coordinates = { x: this.car.x, y: this.car.y, offset: null };
            const end: Coordinates =
                {
                    x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                    y: this.car.y - Math.cos(rayAngle) * this.rayLength,
                    offset: null,
                };

            this.rays.push([start, end]);
        }
    }

    /**
     * @param ctx
     * @return
     */
    draw(ctx: CanvasRenderingContext2D): void
    {
        for (let i = 0; i < this.rayCount; i++)
        {
            let end: Coordinates = this.rays[i][1];
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
