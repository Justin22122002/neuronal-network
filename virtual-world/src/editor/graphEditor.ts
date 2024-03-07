import { Graph } from "../math/graph.ts";
import { Point } from "../primitives/point.ts";
import { Segment } from "../primitives/segment.ts";
import { getNearestPoint } from "../math/utils.ts";
import {Viewport} from "./viewPort.ts";

export class GraphEditor
{
    private readonly ctx: CanvasRenderingContext2D | null;
    private readonly canvas: HTMLCanvasElement;
    private selected: Point | null = null;
    private hovered: Point | null = null;
    private dragging: boolean = false;
    private mouse: Point | null = null;

    constructor
    (
        private viewport: Viewport,
        private graph: Graph
    )
    {
        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");
        this.addEventListeners();
    }

    private addEventListeners(): void
    {
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("contextmenu", (evt: MouseEvent) => evt.preventDefault());
        this.canvas.addEventListener("mouseup", (): boolean => this.dragging = false);
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
