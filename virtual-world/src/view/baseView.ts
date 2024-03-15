import {World} from "../editor/world.ts";
import {GraphEditor} from "../editor/graphEditor.ts";
import {StopEditor} from "../editor/stopEditor.ts";
import {CrossingEditor} from "../editor/crossingEditor.ts";
import {StartEditor} from "../editor/startEditor.ts";
import {ParkingEditor} from "../editor/parkingEditor.ts";
import {LightEditor} from "../editor/lightEditor.ts";
import {TargetEditor} from "../editor/targetEditor.ts";
import {YieldEditor} from "../editor/yieldEditor.ts";
import {Graph} from "../math/graph.ts";
import {Viewport} from "../editor/viewPort.ts";
import {scale} from "../math/utils.ts";

export interface Tools
{
    [key: string]:
        {
            button: HTMLButtonElement;
            editor: GraphEditor | StopEditor | CrossingEditor | StartEditor | ParkingEditor | LightEditor | TargetEditor | YieldEditor;
        };
}

export abstract class BaseView
{
    protected ctx!: CanvasRenderingContext2D;
    protected canvas!: HTMLCanvasElement;
    protected world!: World;
    protected viewport!: Viewport;
    protected tools!: Tools;
    protected oldGraphHash: string = "";

    protected constructor
    (
        private readonly htmlRef: string,
        public ctxWidth: number,
        public ctxHeight: number,
    )
    {
        this.setElement();
        this.loadWorld().then(_ =>
        {
            this.getCanvas();
            this.setup();
            this.animate();
        });
    }

    protected abstract getHTMLContent(): string;

    protected abstract setup(): void;

    protected animate(): void
    {
        if(!this.ctx) return;

        this.viewport.reset();
        if (this.world.graph.hash() != this.oldGraphHash)
        {
            this.world.generate();
            this.oldGraphHash = this.world.graph.hash();
        }
        const viewPoint = scale(this.viewport.getOffset(), -1);
        this.world.draw(this.ctx, viewPoint);
        this.ctx.globalAlpha = 0.3;
        for (const tool of Object.values(this.tools))
        {
            tool.editor.display();
        }
        requestAnimationFrame(this.animate.bind(this));
    }

    protected async loadWorld(): Promise<void>
    {
        const worldString = localStorage.getItem("world");
        const worldInfo = worldString ? JSON.parse(worldString) : null;

        console.log(worldInfo)
        this.world = worldInfo
            ? await World.load(worldInfo)
            : new World(new Graph());
    }

    protected getCanvas(): void
    {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.canvas.width = this.ctxWidth;
        this.canvas.height = this.ctxHeight;

        const renderer: CanvasRenderingContext2D | null = this.canvas.getContext('2d');
        if (!renderer)
        {
            throw new Error("Canvas not supported");
        }

        this.ctx = renderer;
        this.viewport = new Viewport(this.canvas, this.world.offset, this.world.zoom);
    }

    protected setElement(): void
    {
        document.querySelector<HTMLDivElement>(this.htmlRef)!.innerHTML =
            `
                <h1>World Editor</h1>
                <canvas id="canvas"></canvas>
                ${this.getHTMLContent()}
            `
    }

    protected dispose(): void
    {
        const graphEditor = this.tools["graph"].editor as GraphEditor;
        graphEditor.dispose();
        this.world.markings.length = 0;
    }

    protected save(): void
    {
        this.world.zoom = this.viewport.zoom;
        this.world.offset = this.viewport.offset;

        const element = document.createElement("a");
        element.setAttribute(
            "href",
            "data:application/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(this.world))
        );

        const fileName = "name.world";
        element.setAttribute("download", fileName);

        element.click();

        localStorage.setItem("world", JSON.stringify(this.world));
    }

    protected load(event: Event): void
    {
        const fileInput = event.target as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (!file)
        {
            alert("No file selected.");
            return;
        }

        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = async (evt: ProgressEvent<FileReader>): Promise<void> =>
        {
            const fileContent = evt.target?.result as string;
            try
            {
                const jsonData = JSON.parse(fileContent);
                this.world = await World.load(jsonData);
                localStorage.setItem("world", JSON.stringify(this.world));
                location.reload();
            }
            catch (error)
            {
                console.error("Error parsing JSON:", error);
                alert("Error parsing JSON. Please check the file format.");
            }
        };
    }

    protected setMode(mode: string): void
    {
        this.disableEditors();
        ((this.tools)[mode].button as HTMLButtonElement).style.backgroundColor = "white";
        ((this.tools)[mode].button as HTMLButtonElement).style.filter = "";
        ((this.tools)[mode].editor as GraphEditor).enable();
    }

    protected disableEditors(): void
    {
        for (const tool of Object.values(this.tools))
        {
            (tool.button as HTMLButtonElement).style.backgroundColor = "gray";
            (tool.button as HTMLButtonElement).style.filter = "grayscale(100%)";
            (tool.editor as GraphEditor).disable();
        }
    }
}