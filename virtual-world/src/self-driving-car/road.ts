import {Point} from "../primitives/point.ts";
import {lerp} from "../math/utils.ts";

export class Road
{
    public left: number;
    public right: number;
    public top: number;
    public bottom: number;
    public borders: Point[][];

    constructor(public x: number, public width: number, public laneCount: number = 3)
    {
        this.left = x - width / 2;
        this.right = x + width / 2;

        const infinity: number = 1_000_000;

        this.top = -infinity;
        this.bottom = infinity;

        const topLeft: Point = new Point(this.left, this.top);
        const topRight: Point = new Point(this.right, this.top);
        const bottomLeft: Point = new Point(this.left, this.bottom);
        const bottomRight: Point = new Point(this.right, this.bottom);

        this.borders =
        [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    /**
     * laneIndex starts at 0
     * @param laneIndex
     * @return
     */
    getLaneCenter(laneIndex: number): number
    {
        const laneWidth = this.width / this.laneCount;
        return this.left + laneWidth / 2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth;
    }

    /**
     * Draws the car on the canvas context.
     * @param ctx
     * @param color
     * @return void
     */
    draw(ctx: CanvasRenderingContext2D, color: string | CanvasGradient | CanvasPattern): void
    {
        ctx.lineWidth = 5;
        ctx.strokeStyle = color;

        for (let i = 1; i <= this.laneCount - 1; i++)
        {
            const x: number = lerp
            (
                this.left,
                this.right,
                i / this.laneCount
            );

            ctx.setLineDash([20, 20]);
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        this.borders.forEach(border =>
        {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });
    }
}
