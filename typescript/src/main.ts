import './style.css'
import {Road} from "./models/road.ts";
import {Car} from "./models/car.ts";
import {ControlType} from "./models/enums/controlType.ts";
import {getRandomColor} from "./utils/utils.ts";
import {NeuralNetwork} from "./models/neural-network/neural-network.ts";
import {Visualizer} from "./models/neural-network/visualizer.ts";

document.querySelector<HTMLDivElement>('#app')!.innerHTML =
`
    <div class="container">
        <div id="verticalButtons">
            <button id="save">💾</button>
            <button id="delete">🗑️</button>
        </div>
        <canvas id="carCanvas"></canvas> 
        <canvas id="networkCanvas"></canvas>   
    </div>
`

const carCanvas: HTMLCanvasElement = document.getElementById('carCanvas') as HTMLCanvasElement;
const networkCanvas: HTMLCanvasElement = document.getElementById('networkCanvas') as HTMLCanvasElement;

carCanvas.width = 200;
networkCanvas.width = 300;

const saveButton: HTMLButtonElement = document.getElementById('save') as HTMLButtonElement;
saveButton.addEventListener('click', () => save());
const deleteButton: HTMLButtonElement = document.getElementById('delete') as HTMLButtonElement;
deleteButton.addEventListener('click', () => discard());

const carCtx: CanvasRenderingContext2D | null = carCanvas.getContext('2d');
const networkCtx: CanvasRenderingContext2D | null = networkCanvas.getContext('2d');
const road: Road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const N: number = 100;
const cars: Car[] = generateCars(N);

const traffic: Car[] =
[
    new Car(road.getLaneCenter(1), -100, 30, 50, ControlType.DUMMY, 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, ControlType.DUMMY, 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, ControlType.DUMMY, 1, getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, ControlType.DUMMY, 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -700, 30, 50, ControlType.DUMMY, 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -700, 30, 50, ControlType.DUMMY, 2, getRandomColor()),
];

let bestCar: Car = cars[0];

if (localStorage.getItem('bestBrain') !== null)
{
    const bestBrainString: string = localStorage.getItem('bestBrain')!;
    console.log(JSON.parse(bestBrainString));
    bestCar.brain = JSON.parse(bestBrainString);
}

const bestBrainString: string | null = localStorage.getItem('bestBrain');

if (bestBrainString !== null)
{
    bestCar.brain = JSON.parse(bestBrainString);

    for (let i = 0; i < cars.length; i++)
    {
        if (i !== 0)
        {
            const mutatedBrain = JSON.parse(bestBrainString);
            NeuralNetwork.mutate(mutatedBrain, 0.1);
            cars[i].brain = mutatedBrain;
        }
    }
}


animate(10);

function animate(time: number): void
{
    traffic.forEach(t => t.update(road.borders, []));

    cars.forEach(car => car.update(road.borders, traffic));
    bestCar = cars.find(c => c.y === Math.min(...cars.map(c => c.y)))!;

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx!.save();
    carCtx!.translate(0, -bestCar.y + carCanvas.height * 0.75);

    road.draw(carCtx!, 'white');

    carCtx!.globalAlpha = 0.2;
    cars.forEach(car => car.draw(carCtx!, false));
    carCtx!.globalAlpha = 1;
    bestCar.draw(carCtx!, true);

    traffic.forEach(t => t.draw(carCtx!))

    carCtx!.restore();

    networkCtx!.lineDashOffset = -time / 50;
    if (bestCar.brain)
    {
        Visualizer.drawNetwork(networkCtx!, bestCar.brain);
    }
    else
    {
        console.error("brain is undefined");
    }

    requestAnimationFrame(animate);
}

function generateCars(N: number): Car[]
{
    const cars: Car[] = [];
    for (let i = 1; i <= N; i++)
    {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, ControlType.AI, 3, 'blue'));
    }
    return cars;
}

function save(): void
{
    localStorage.setItem('bestBrain', JSON.stringify(bestCar.brain));
}

function discard(): void
{
    localStorage.removeItem('bestBrain');
}
