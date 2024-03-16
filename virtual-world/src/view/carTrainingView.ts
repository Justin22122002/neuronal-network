import {BaseView} from "./baseView.ts";
import {angle, scale} from "../math/utils.ts";
import {Car} from "../self-driving-car/car.ts";
import {ControlType} from "../self-driving-car/enums/controlType.ts";
import {NeuralNetwork} from "../self-driving-car/neural-network/neural-network.ts";
import {Visualizer} from "../self-driving-car/neural-network/visualizer.ts";
import {Point} from "../primitives/point.ts";
import {Start} from "../markings/start.ts";

export class CarTrainingView extends BaseView
{
    private networkCanvas!: HTMLCanvasElement;
    private networkCtx!: CanvasRenderingContext2D;
    private cars: Car[] = [];
    private bestCar!: Car;
    private roadBorders!: Point[][];
    private time: number = 0;

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
                <canvas id="networkCanvas"></canvas>   
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
        this.networkCanvas.height = window.innerHeight;

        const networkContext: CanvasRenderingContext2D | null = this.networkCanvas.getContext('2d');
        if(!networkContext) throw new Error("No Network CTX");

        this.networkCtx = networkContext;

        this.cars = this.generateCars(100);

        if (localStorage.getItem('bestBrain') !== null)
        {
            for (let i = 0; i < this.cars.length; i++)
            {
                this.cars[i].brain = JSON.parse(localStorage.getItem('bestBrain')!);
                if (i !== 0)
                {
                    NeuralNetwork.mutate(this.cars[i].brain!, 0.1);
                }
            }
        }

        // Setup road borders
        this.roadBorders = this.world.roadBorders.map((s) => [s.p1, s.p2]);

        // Set initial best car
        this.bestCar = this.cars[0];

        this.world.cars = this.cars;
        this.world.bestCar = this.bestCar;
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

        if (this.bestCar.brain)
        {
            Visualizer.drawNetwork(this.networkCtx, this.bestCar.brain);
        }
        else
        {
            console.error("brain is undefined");
        }

        for (const car of this.cars)
        {
            car.update(this.roadBorders, []);
        }

        const best = this.cars.find(
            c=> c.fittness === Math.max(
                ...this.cars.map(c=>c.fittness)
            ));

        if(best) this.bestCar = best;

        // Reset viewport
        this.viewport.offset.x = -this.bestCar.x;
        this.viewport.offset.y = -this.bestCar.y;
    }

    private animateWorld(): void
    {
        this.viewport.reset();
        const viewPoint = scale(this.viewport.getOffset(), -1);
        this.world.draw(this.ctx, viewPoint, false);
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
        localStorage.setItem("bestBrain", JSON.stringify(this.bestCar.brain));
    }

    private discard(): void
    {
        localStorage.removeItem("bestBrain");
    }
}