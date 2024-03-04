import {Point} from "../primitives/point.ts";
import {add, scale, subtract} from "../math/utils.ts";

export class Viewport
{
    private readonly ctx: CanvasRenderingContext2D | null;
    private _zoom: number = 1;
    private center: Point;
    private offset: Point;
    private drag:
    {
        start: Point;
        end: Point;
        offset: Point;
        active: boolean;
    };

    constructor(private _canvas: HTMLCanvasElement)
    {
        this.ctx = _canvas.getContext("2d");

        this._zoom = 1;
        this.center = new Point(_canvas.width / 2, _canvas.height / 2);
        this.offset = scale(this.center, -1);

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
        this.ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this.ctx.save();
        this.ctx.translate(this.center.x, this.center.y);
        this.ctx.scale(1 / this._zoom, 1 / this._zoom);
        const offset = this.getOffset();
        this.ctx.translate(offset.x, offset.y);
    }

    getMouse(evt: MouseEvent, subtractDragOffset: boolean = false): Point
    {
        const p = new Point(
            (evt.offsetX - this.center.x) * this._zoom - this.offset.x,
            (evt.offsetY - this.center.y) * this._zoom - this.offset.y
        );
        return subtractDragOffset ? subtract(p, this.drag.offset) : p;
    }

    getOffset(): Point
    {
        return add(this.offset, this.drag.offset);
    }

    private addEventListeners(): void
    {
        this._canvas.addEventListener("wheel", this.handleMouseWheel.bind(this));
        this._canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this._canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this._canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
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
        this._zoom += dir * step;
        this._zoom = Math.max(1, Math.min(5, this._zoom));
    }

    get canvas(): HTMLCanvasElement
    {
        return this._canvas;
    }

    set canvas(value: HTMLCanvasElement)
    {
        this._canvas = value;
    }


    get zoom(): number
    {
        return this._zoom;
    }

    set zoom(value: number)
    {
        this._zoom = value;
    }
}