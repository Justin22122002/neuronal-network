import './style.css'
import {Graph} from "./math/graph.ts";
import {Segment} from "./primitives/segment.ts";
import {Point} from "./primitives/point.ts";

document.querySelector<HTMLDivElement>('#app')!.innerHTML =
    `
        <h1>World Editor</h1>
        <canvas id="canvas"></canvas>
        <div>
            <button id="addRandomPoint">Add Point</button>
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

const p1 = new Point(200, 200);
const p2 = new Point(500, 200);
const p3 = new Point(400, 400);
const p4 = new Point(100, 300);

const s1 = new Segment(p1, p2);
const s2 = new Segment(p1, p3);
const s3 = new Segment(p1, p4);
const s4 = new Segment(p2, p3);

const graph = new Graph([p1, p2, p3, p4], [s1, s2, s3, s4]);

graph.draw(canvasCtx);

const button: HTMLButtonElement = document.getElementById('addRandomPoint') as HTMLButtonElement;
button.addEventListener("click", () => addRandomPoint());
function addRandomPoint(): void
{
    if(!canvasCtx)
    {
        throw new Error("Canvas not supported");
    }

    const p = new Point(Math.random() * canvas.width, Math.random() * canvas.height);
    graph.tryAddPoint(p);
    graph.draw(canvasCtx);
}