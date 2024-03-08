import './style.css';
import { Graph } from "./math/graph";
import { GraphEditor } from "./editor/graphEditor";
import { Viewport } from "./editor/viewPort";
import { World } from "./editor/world";
import { scale } from "./math/utils";
import {StopEditor} from "./editor/stopEditor.ts";
import {CrossingEditor} from "./editor/crossingEditor.ts";
import {StartEditor} from "./editor/startEditor.ts";
import {ParkingEditor} from "./editor/parkingEditor.ts";
import {LightEditor} from "./editor/lightEditor.ts";
import {TargetEditor} from "./editor/targetEditor.ts";
import {YieldEditor} from "./editor/yieldEditor.ts";

document.querySelector<HTMLDivElement>('#app')!.innerHTML =
    `
    <h1>World Editor</h1>
    <canvas id="canvas"></canvas>
    <div id="controls">
        <button id="dispose">🗑️</button>
        <button id="save">💾</button>
        &nbsp;
        <button id="graphBtn">🌐</button>
        <button id="stopBtn">🛑</button>
        <button id="yieldBtn">⚠️</button>
        <button id="crossingBtn">🚶</button>
        <button id="parkingBtn">🅿️</button>
        <button id="lightBtn">🚦</button>
        <button id="startBtn">🚙</button>
        <button id="targetBtn">🎯</button>
    </div>
`

const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = 600;
canvas.height = 600;

const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

if (!ctx)
{
    throw new Error("Canvas not supported");
}

const graphString: string | null = localStorage.getItem("graph");
const graphInfo: Graph = graphString ? JSON.parse(graphString) : null;
const graph: Graph = graphString
    ? Graph.load(graphInfo)
    : new Graph();

const saveButton: HTMLButtonElement = document.getElementById('save') as HTMLButtonElement;
const disposeButton: HTMLButtonElement = document.getElementById('dispose') as HTMLButtonElement;
saveButton.addEventListener("click", save);
disposeButton.addEventListener("click", dispose);

const graphBtn: HTMLButtonElement = document.getElementById('graphBtn') as HTMLButtonElement;
const stopBtn: HTMLButtonElement = document.getElementById('stopBtn') as HTMLButtonElement;
const crossingBtn: HTMLButtonElement = document.getElementById('crossingBtn') as HTMLButtonElement;
const startBtn: HTMLButtonElement = document.getElementById('startBtn') as HTMLButtonElement;
const parkingBtn: HTMLButtonElement = document.getElementById('parkingBtn') as HTMLButtonElement;
const lightBtn: HTMLButtonElement = document.getElementById('lightBtn') as HTMLButtonElement;
const targetBtn: HTMLButtonElement = document.getElementById('targetBtn') as HTMLButtonElement;
const yieldBtn: HTMLButtonElement = document.getElementById('yieldBtn') as HTMLButtonElement;

graphBtn.addEventListener("click", () => setMode('graph'));
stopBtn.addEventListener("click", () => setMode('stop'));
crossingBtn.addEventListener("click", () => setMode('crossing'));
startBtn.addEventListener("click", () => setMode('start'));
parkingBtn.addEventListener("click", () => setMode('parking'));
lightBtn.addEventListener("click", () => setMode('light'));
targetBtn.addEventListener("click", () => setMode('target'));
yieldBtn.addEventListener("click", () => setMode('yield'));

const world = new World(graph);
const viewport = new Viewport(canvas);
interface Tools
{
    [key: string]:
        {
        button: HTMLButtonElement;
        editor: GraphEditor | StopEditor | CrossingEditor | StartEditor | ParkingEditor | LightEditor | TargetEditor | YieldEditor;
    };
}

const tools: Tools =
    {
    graph: { button: graphBtn, editor: new GraphEditor(viewport, graph) },
    stop: { button: stopBtn, editor: new StopEditor(viewport, world) },
    crossing: { button: crossingBtn, editor: new CrossingEditor(viewport, world) },
    start: { button: startBtn, editor: new StartEditor(viewport, world) },
    parking: { button: parkingBtn, editor: new ParkingEditor(viewport, world) },
    light: { button: lightBtn, editor: new LightEditor(viewport, world) },
    target: { button: targetBtn, editor: new TargetEditor(viewport, world) },
    yield: { button: yieldBtn, editor: new YieldEditor(viewport, world) },
};


let oldGraphHash: string = graph.hash();

setMode("graph");

animate();

function animate()
{
    if(!ctx) return;
    viewport.reset();
    if (graph.hash() != oldGraphHash)
    {
        world.generate();
        oldGraphHash = graph.hash();
    }
    const viewPoint = scale(viewport.getOffset(), -1);
    world.draw(ctx, viewPoint);
    ctx.globalAlpha = 0.3;
    for (const tool of Object.values(tools))
    {
        tool.editor.display();
    }
    requestAnimationFrame(animate);
}

function dispose(): void
{
    const graphEditor = tools["graph"].editor as GraphEditor;
    graphEditor.dispose();
    world.markings.length = 0;
}

function save(): void
{
    localStorage.setItem("graph", graph.toJSON());
}

function setMode(mode: string): void
{
    disableEditors();
    (tools[mode].button as HTMLButtonElement).style.backgroundColor = "white";
    (tools[mode].button as HTMLButtonElement).style.filter = "";
    (tools[mode].editor as GraphEditor).enable();
}

function disableEditors(): void
{
    for (const tool of Object.values(tools))
    {
        (tool.button as HTMLButtonElement).style.backgroundColor = "gray";
        (tool.button as HTMLButtonElement).style.filter = "grayscale(100%)";
        (tool.editor as GraphEditor).disable();
    }
}
