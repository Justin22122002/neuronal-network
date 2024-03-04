import './style.css'
import {Graph} from "./math/graph.ts";
import {GraphEditor} from "./editor/graphEditor.ts";
import {Viewport} from "./editor/viewPort.ts";

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

const canvasCtx: CanvasRenderingContext2D | null = canvas.getContext('2d');

if(!canvasCtx)
{
    throw new Error("Canvas not supported");
}

const graphString = localStorage.getItem("graph");
const graphInfo = graphString ? JSON.parse(graphString) : null;
const graph = graphInfo
    ? Graph.load(graphInfo)
    : new Graph();
const viewport = new Viewport(canvas);
const graphEditor = new GraphEditor(viewport, graph);

const saveButton = document.getElementById('save') as HTMLButtonElement;
const disposeButton = document.getElementById('dispose') as HTMLButtonElement;
saveButton.addEventListener("click", save);
disposeButton.addEventListener("click", dispose);

animate();

function animate(): void
{
    if (canvasCtx)
    {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        viewport.reset();
        graphEditor.display();
        requestAnimationFrame(animate);
    }
}

function dispose()
{
    graphEditor.dispose();
}

function save()
{
    localStorage.setItem("graph", graph.toJSON());
}
