import {Point} from "../primitives/point.ts";
import {Viewport} from "./viewPort.ts";
import {World} from "./world.ts";
import {Segment} from "../primitives/segment.ts";
import {Marking} from "../markings/marking.ts";
import {getNearestSegment} from "../math/utils.ts";
import {Polygon} from "../primitives/polygon.ts";

export abstract class MarkingEditor
{
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D | null;
    protected mouse: Point | null;
    protected intent: Marking | null;
    protected markings: Marking[];

    protected boundMouseDown = this.handleMouseDown.bind(this);
    protected boundMouseMove = this.handleMouseMove.bind(this);
    protected boundContextMenu = (evt: MouseEvent) => evt.preventDefault();

    protected constructor
    (
        protected viewport: Viewport,
        protected world: World,
        protected targetSegments: Segment[]
    ) 
    {
        this.canvas = viewport.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.mouse = null;
        this.intent = null;

        this.markings = world.markings;
    }

    // to be overwritten
    abstract createMarking(center: Point, directionVector: Point): Marking;

    enable(): void
    {
        this.addEventListeners();
    }

    disable(): void
    {
        this.removeEventListeners();
    }

    protected addEventListeners(): void
    {
        this.canvas.addEventListener("mousedown", this.boundMouseDown);
        this.canvas.addEventListener("mousemove", this.boundMouseMove);
        this.canvas.addEventListener("contextmenu", this.boundContextMenu);
    }

    protected removeEventListeners(): void
    {
        this.canvas.removeEventListener("mousedown", this.boundMouseDown);
        this.canvas.removeEventListener("mousemove", this.boundMouseMove);
        this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
    }

    protected handleMouseMove(evt: MouseEvent): void
    {
        this.mouse = this.viewport.getMouse(evt, true);
        const seg = getNearestSegment
        (
            this.mouse,
            this.targetSegments,
            10 * this.viewport.zoom
        );
        if (seg)
        {
            const proj: Point = seg.projectPoint(this.mouse);
            if(proj.offset)
            {
                if (proj.offset >= 0 && proj.offset <= 1)
                {
                    this.intent = this.createMarking
                    (
                        proj,
                        seg.directionVector()
                    );
                }
            }
            else
            {
                this.intent = null;
            }
        }
        else
        {
            this.intent = null;
        }
    }

    protected handleMouseDown(evt: MouseEvent): void
    {
        if (evt.button == 0)
        { // left click
            if (this.intent)
            {
                this.markings.push(this.intent);
                this.intent = null;
            }
        }
        if (evt.button == 2)
        { // right click
            for (let i = 0; i < this.markings.length; i++)
            {
                const poly: Polygon = this.markings[i].poly;
                if (this.mouse && poly.containsPoint(this.mouse))
                {
                    this.markings.splice(i, 1);
                    return;
                }
            }
        }
    }

    display(): void
    {
        if(!this.ctx) return;

        if (this.intent)
        {
            this.intent.draw(this.ctx);
        }
    }
}