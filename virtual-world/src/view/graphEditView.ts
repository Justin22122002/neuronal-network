import {BaseView} from "./baseView.ts";
import {GraphEditor} from "../editor/graphEditor.ts";
import {StopEditor} from "../editor/stopEditor.ts";
import {CrossingEditor} from "../editor/crossingEditor.ts";
import {StartEditor} from "../editor/startEditor.ts";
import {ParkingEditor} from "../editor/parkingEditor.ts";
import {LightEditor} from "../editor/lightEditor.ts";
import {TargetEditor} from "../editor/targetEditor.ts";
import {YieldEditor} from "../editor/yieldEditor.ts";

export class GraphEditView extends BaseView
{
    constructor
    (
        htmlRef: string,
        ctxWidth: number,
        ctxHeight: number,
    )
    {
        super(htmlRef, ctxWidth, ctxHeight);
    }

    protected override getHTMLContent(): string
    {
        return `
        <div id="controls">
            <button id="dispose">🗑️</button>
            <button id="save">💾</button>
            
            <label for="fileInput" class="file-input-label">
                📁
                <input
                   type="file"
                   id="fileInput"
                   accept=".world"
                />
             </label>
            &nbsp
            <button id="graphBtn">🌐</button>
            <button id="stopBtn">🛑</button>
            <button id="yieldBtn">⚠️</button>
            <button id="crossingBtn">🚶</button>
            <button id="parkingBtn">🅿️</button>
            <button id="lightBtn">🚦</button>
            <button id="startBtn">🚙</button>
            <button id="targetBtn">🎯</button>
        </div>
        `;
    }

    protected override setup(): void
    {
        const saveButton: HTMLButtonElement = document.getElementById('save') as HTMLButtonElement;
        const disposeButton: HTMLButtonElement = document.getElementById('dispose') as HTMLButtonElement;
        const fileInput: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement;
        saveButton.addEventListener("click", this.save.bind(this));
        disposeButton.addEventListener("click", this.dispose.bind(this));
        fileInput.onchange = (event) => this.load(event);

        const graphBtn: HTMLButtonElement = document.getElementById('graphBtn') as HTMLButtonElement;
        const stopBtn: HTMLButtonElement = document.getElementById('stopBtn') as HTMLButtonElement;
        const crossingBtn: HTMLButtonElement = document.getElementById('crossingBtn') as HTMLButtonElement;
        const startBtn: HTMLButtonElement = document.getElementById('startBtn') as HTMLButtonElement;
        const parkingBtn: HTMLButtonElement = document.getElementById('parkingBtn') as HTMLButtonElement;
        const lightBtn: HTMLButtonElement = document.getElementById('lightBtn') as HTMLButtonElement;
        const targetBtn: HTMLButtonElement = document.getElementById('targetBtn') as HTMLButtonElement;
        const yieldBtn: HTMLButtonElement = document.getElementById('yieldBtn') as HTMLButtonElement;

        this.tools =
        {
            graph: { button: graphBtn, editor: new GraphEditor(this.viewport, this.world.graph) },
            stop: { button: stopBtn, editor: new StopEditor(this.viewport, this.world) },
            crossing: { button: crossingBtn, editor: new CrossingEditor(this.viewport, this.world) },
            start: { button: startBtn, editor: new StartEditor(this.viewport, this.world) },
            parking: { button: parkingBtn, editor: new ParkingEditor(this.viewport, this.world) },
            light: { button: lightBtn, editor: new LightEditor(this.viewport, this.world) },
            target: { button: targetBtn, editor: new TargetEditor(this.viewport, this.world) },
            yield: { button: yieldBtn, editor: new YieldEditor(this.viewport, this.world) },
        };

        graphBtn.addEventListener("click", () => this.setMode('graph'));
        stopBtn.addEventListener("click", () => this.setMode('stop'));
        crossingBtn.addEventListener("click", () => this.setMode('crossing'));
        startBtn.addEventListener("click", () => this.setMode('start'));
        parkingBtn.addEventListener("click", () => this.setMode('parking'));
        lightBtn.addEventListener("click", () => this.setMode('light'));
        targetBtn.addEventListener("click", () => this.setMode('target'));
        yieldBtn.addEventListener("click", () => this.setMode('yield'));

        this.setMode("graph");
    }
}