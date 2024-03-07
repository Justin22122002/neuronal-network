import './style.css'
import {Graph} from "./math/graph.ts";
import {GraphEditor} from "./editor/graphEditor.ts";
import {Viewport} from "./editor/viewPort.ts";
import {World} from "./editor/world.ts";
import {scale} from "./math/utils.ts";

document.querySelector<HTMLDivElement>('#app')!.innerHTML =
`
    <h1>World Editor</h1>
    <canvas id="canvas"></canvas>
    <div id="controls">
        <button id="dispose">🗑️</button>
        <button id="save">💾</button>
    </div>
`

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = 600;
canvas.height = 600;

const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

if(!ctx)
{
    throw new Error("Canvas not supported");
}

const graphString: string | null = localStorage.getItem("graph");
const graphInfo: Graph = graphString ? JSON.parse(graphString) : null;
const graph: Graph = graphString
    ? Graph.load(graphInfo)
    : new Graph();

const world = new World(graph);
const viewport = new Viewport(canvas);
const graphEditor = new GraphEditor(viewport, graph);

const saveButton: HTMLButtonElement = document.getElementById('save') as HTMLButtonElement;
const disposeButton: HTMLButtonElement = document.getElementById('dispose') as HTMLButtonElement;
saveButton.addEventListener("click", save);
disposeButton.addEventListener("click", dispose);

let oldGraphHash: string = graph.hash();
animate();

function animate(): void
{
    if (ctx)
    {
        viewport.reset();
        if (graph.hash() != oldGraphHash)
        {
            world.generate();
            oldGraphHash = graph.hash();
        }
        const viewPoint = scale(viewport.getOffset(), -1);
        world.draw(ctx, viewPoint);
        ctx.globalAlpha = 0.3;
        graphEditor.display();
        requestAnimationFrame(animate);
    }
}

function dispose(): void
{
    graphEditor.dispose();
}

function save(): void
{
    localStorage.setItem("graph", graph.toJSON());
}
