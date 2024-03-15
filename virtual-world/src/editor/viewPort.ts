import {Point} from "../primitives/point.ts";
import {add, scale, subtract} from "../math/utils.ts";

export class Viewport
{
    public readonly ctx: CanvasRenderingContext2D | null;
    public readonly center: Point;
    public drag:
        {
            start: Point;
            end: Point;
            offset: Point;
            active: boolean;
        };

    constructor
    (
        public canvas: HTMLCanvasElement,
        public offset: Point,
        public zoom: number = 1
    )
    {
        this.ctx = canvas.getContext("2d");

        this.center = new Point(canvas.width / 2, canvas.height / 2);
        this.offset = this.offset ? this.offset : scale(this.center, -1);

        this.drag =
            {
                start: new Point(0, 0),
                end: new Point(0, 0),
                offset: new Point(0, 0),
                active: false,
            };

        this.addEventListeners();
    }

    reset(): void
    {
        if (!this.ctx) return;

        this.ctx.restore();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.center.x, this.center.y);
        this.ctx.scale(1 / this.zoom, 1 / this.zoom);
        const offset = this.getOffset();
        this.ctx.translate(offset.x, offset.y);
    }

    getMouse(evt: MouseEvent, subtractDragOffset: boolean = false): Point
    {
        const p = new Point(
            (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
            (evt.offsetY - this.center.y) * this.zoom - this.offset.y
        );
        return subtractDragOffset ? subtract(p, this.drag.offset) : p;
    }

    getOffset(): Point
    {
        return add(this.offset, this.drag.offset);
    }

    private addEventListeners(): void
    {
        this.canvas.addEventListener("wheel", this.handleMouseWheel.bind(this));
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    }

    private handleMouseDown(evt: MouseEvent): void
    {
        if (evt.button == 1)
        {
            // middle button
            this.drag.start = this.getMouse(evt);
            this.drag.active = true;
        }
    }

    private handleMouseMove(evt: MouseEvent): void
    {
        if (this.drag.active)
        {
            this.drag.end = this.getMouse(evt);
            this.drag.offset = subtract(this.drag.end, this.drag.start);
        }
    }

    private handleMouseUp(): void
    {
        if (this.drag.active)
        {
            this.offset = add(this.offset, this.drag.offset);
            this.drag =
            {
                start: new Point(0, 0),
                end: new Point(0, 0),
                offset: new Point(0, 0),
                active: false,
            };
        }
    }

    private handleMouseWheel(evt: WheelEvent): void
    {
        const dir = Math.sign(evt.deltaY);
        const step = 0.1;
        this.zoom += dir * step;
        this.zoom = Math.max(1, Math.min(5, this.zoom));
    }
}