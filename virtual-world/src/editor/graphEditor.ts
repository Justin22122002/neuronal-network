import { Graph } from "../math/graph.ts";
import { Point } from "../primitives/point.ts";
import { Segment } from "../primitives/segment.ts";
import { getNearestPoint } from "../math/utils.ts";
import {Viewport} from "./viewPort.ts";

export class GraphEditor
{
    public readonly ctx: CanvasRenderingContext2D | null;
    public canvas: HTMLCanvasElement;
    public selected: Point | null = null;
    public hovered: Point | null = null;
    public dragging: boolean = false;
    public mouse: Point | null = null;

    private boundMouseDown = this.handleMouseDown.bind(this);
    private boundMouseMove = this.handleMouseMove.bind(this);
    private boundMouseUp = () => this.dragging = false;
    private boundContextMenu = (evt: MouseEvent) => evt.preventDefault();

    constructor
    (
        public viewport: Viewport,
        public graph: Graph
    )
    {
        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");
        this.addEventListeners();
    }

    enable(): void
    {
        this.addEventListeners();
    }

    disable(): void
    {
        this.removeEventListeners();
        this.selected = null;
        this.hovered = null;
    }

    private addEventListeners(): void
    {
        this.canvas.addEventListener("mousedown", this.boundMouseDown);
        this.canvas.addEventListener("mousemove", this.boundMouseMove);
        this.canvas.addEventListener("mouseup", this.boundMouseUp);
        this.canvas.addEventListener("contextmenu", this.boundContextMenu);
    }

    private removeEventListeners(): void
    {
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("mouseup", this.boundMouseUp);
        this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    }

    private handleMouseMove(evt: MouseEvent): void
    {
        if (!this.ctx) return;

        this.mouse = this.viewport.getMouse(evt, true);
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 10 * this.viewport.zoom);

        if (this.dragging && this.selected)
        {
            this.selected.x = this.mouse.x;
            this.selected.y = this.mouse.y;
        }
    }

    private handleMouseDown(evt: MouseEvent): void
    {
        if (evt.button == 2)
        { // right click
            if (this.selected)
            {
                this.selected = null;
            } else if (this.hovered)
            {
                this.removePoint(this.hovered);
            }
        }

        if (evt.button == 0)
        { // left click
            if (this.hovered)
            {
                this.select(this.hovered);
                this.dragging = true;
                return;
            }

            this.graph.addPoint(this.mouse as Point);
            this.select(this.mouse as Point);
            this.hovered = this.mouse as Point;
        }
    }

    private select(point: Point): void
    {
        if (this.selected)
        {
            this.graph.tryAddSegment(new Segment(this.selected, point));
        }
        this.selected = point;
    }

    private removePoint(point: Point): void
    {
        this.graph.removePoint(point);
        this.hovered = null;
        if (this.selected == point)
        {
            this.selected = null;
        }
    }

    dispose(): void
    {
        this.graph.dispose();
        this.selected = null;
        this.hovered = null;
    }

    display(): void
    {
        if (!this.ctx) return;

        this.graph.draw(this.ctx);

        if (this.hovered)
        {
            this.hovered.draw(this.ctx, { fill: true });
        }

        if (this.selected)
        {
            const intent: Point | null = this.hovered ? this.hovered : this.mouse;
            new Segment(this.selected, intent as Point).draw(this.ctx, { dash: [3, 3] });
            this.selected.draw(this.ctx, { outline: true });
        }
    }
}
