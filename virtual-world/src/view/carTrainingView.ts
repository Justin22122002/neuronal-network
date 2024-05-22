import {BaseView} from "./baseView.ts";
import {angle, scale} from "../math/utils.ts";
import {Car} from "../self-driving-car/car.ts";
import {ControlType} from "../self-driving-car/enums/controlType.ts";
import {NeuralNetwork} from "../self-driving-car/neural-network/neural-network.ts";
import {Visualizer} from "../self-driving-car/neural-network/visualizer.ts";
import {Point} from "../primitives/point.ts";
import {Start} from "../markings/start.ts";
import {MiniMap} from "../miniMap/miniMap.ts";

export class CarTrainingView extends BaseView
{
    private networkCanvas!: HTMLCanvasElement;
    private networkCtx!: CanvasRenderingContext2D;
    private roadBorders!: Point[][];
    private time: number = 0;
    private miniMap!: MiniMap;

    constructor
    (
        htmlRef: string,
        ctxWidth: number,
        ctxHeight: number
    )
    {
        super(htmlRef, ctxWidth, ctxHeight);
    }

    protected override getHTMLContent(): string
    {
        return `
            <div class="container">
                <canvas id="canvas"></canvas> 
                <div id="verticalButtons">
                    <button id="saveButton">💾</button>
                    <button id="deleteButton">🗑️</button>
                </div>
                <div>
                    <canvas id="networkCanvas"></canvas>
                    <canvas id="miniMapCanvas"></canvas>
                </div>  
            </div>
        `;
    }
    protected override setup(): void
    {
        const saveButton: HTMLButtonElement = document.getElementById('saveButton') as HTMLButtonElement;
        const deleteButton: HTMLButtonElement = document.getElementById('deleteButton') as HTMLButtonElement;

        saveButton.addEventListener("click", () => this.saveCar.bind(this)())
        deleteButton.addEventListener("click", () => this.discard.bind(this)())

        this.networkCanvas = document.getElementById('networkCanvas') as HTMLCanvasElement;
        this.networkCanvas.width = 300;
        this.networkCanvas.height = window.innerHeight - 308;

        const networkContext: CanvasRenderingContext2D | null = this.networkCanvas.getContext('2d');
        if(!networkContext) throw new Error("No Network CTX");

        this.networkCtx = networkContext;

        this.world.cars = this.generateCars(1);

        if (localStorage.getItem('bestBrain') !== null)
        {
            for (let i = 0; i < this.world.cars.length; i++)
            {
                this.world.cars[i].brain = JSON.parse(localStorage.getItem('bestBrain')!);
                if (i !== 0)
                {
                    NeuralNetwork.mutate(this.world.cars[i].brain!, 0.1);
                }
            }
        }

        // Setup road borders
        this.roadBorders = this.world.roadBorders.map((s) => [s.p1, s.p2]);

        // Set initial best car
        this.world.bestCar = this.world.cars[0];

        // setup Minimap
        const miniMapCanvas: HTMLCanvasElement = document.getElementById('miniMapCanvas') as HTMLCanvasElement;
        this.miniMap = new MiniMap(miniMapCanvas, this.world.graph, 300);
    }

    protected override animate(): void
    {
        this.animateCarAndNetwork();
        this.animateWorld();
        requestAnimationFrame(this.animate.bind(this));
    }

    private animateCarAndNetwork(): void
    {
        this.networkCtx.clearRect(0, 0, this.networkCanvas.width, this.networkCanvas.height);
        this.networkCtx.lineDashOffset = -this.time / 50;
        this.time += 25;

        if (this.world.bestCar && this.world.bestCar.brain)
        {
            Visualizer.drawNetwork(this.networkCtx, this.world.bestCar.brain);
        }
        else
        {
            console.error("brain is undefined");
        }

        for (const car of this.world.cars)
        {
            car.update(this.roadBorders, []);
        }

        const best = this.world.cars.find(
            c=> c.fittness === Math.max(
                ...this.world.cars.map(c=>c.fittness)
            ));

        if(best) this.world.bestCar = best;

        // Reset viewport
        if (this.world.bestCar)
        {
            this.viewport.offset.x = -this.world.bestCar.x;
            this.viewport.offset.y = -this.world.bestCar.y;
        }
    }

    private animateWorld(): void
    {
        this.viewport.reset();
        const viewPoint = scale(this.viewport.getOffset(), -1);
        this.world.draw(this.ctx, viewPoint, false);
        this.miniMap.update(viewPoint);
        this.ctx.globalAlpha = 0.3;

        for (const tool of Object.values(this.tools))
        {
            tool.editor.display();
        }
    }

    private generateCars(N: number): Car[]
    {
        const startPoints = this.world.markings.filter((m) => m instanceof Start);
        const startPoint = startPoints.length > 0 ? startPoints[0].center : new Point(100, 100);
        const dir = startPoints.length > 0 ? startPoints[0].directionVector : new Point(0, -1);
        const startAngle = -angle(dir) + Math.PI / 2;
        const cars: Car[] = [];

        for (let i = 1; i <= N; i++)
        {
            cars.push(new Car(startPoint.x, startPoint.y, 30, 50, ControlType.AI, startAngle));
        }
        return cars;
    }

    private saveCar(): void
    {
        if(!this.world.bestCar) return;
        localStorage.setItem("bestBrain", JSON.stringify(this.world.bestCar.brain));
    }

    private discard(): void
    {
        localStorage.removeItem("bestBrain");
    }
}