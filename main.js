'use strict'

import { Car } from './models/car.js';
import { Road } from "./models/road.js";
import { ControlType } from "./models/coordinates.js";
import { Visualizer } from "./neural-network/visualizer.js";
import { NeuralNetwork } from "./neural-network/neural-network.js";
import { getRandomColor } from "./utils/utils.js";

const carCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("carCanvas"));
carCanvas.width = 200;

const networkCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("networkCanvas"));
networkCanvas.width = 300;

const saveButton = /** @type {HTMLButtonElement} */ document.getElementById("save");
saveButton.addEventListener('click', e => save());
const deleteButton = /** @type {HTMLButtonElement} */  document.getElementById("delete");
deleteButton.addEventListener('click', e => discard());

/** @type {CanvasRenderingContext2D | null} */
const carCtx = carCanvas.getContext("2d");
/** @type {CanvasRenderingContext2D | null} */
const networkCtx = networkCanvas.getContext("2d");
/** @type {Road} */
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
/** @type {number} */
const N = 100;
/** @type {Car[]} */
const cars = generateCars(N);
/** @type {Car[]} */
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, ControlType.DUMMY, 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -300, 30, 50, ControlType.DUMMY, 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, ControlType.DUMMY, 1, getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, ControlType.DUMMY, 2, getRandomColor()),
]
/** @type {Car} */
let bestCar = cars[0];

if(localStorage.getItem("bestBrain")) 
{
    console.log(JSON.parse(localStorage.getItem("bestBrain")))
    bestCar.brain = JSON.parse(localStorage.getItem("bestBrain"));
}

if(localStorage.getItem("bestBrain"))
{
    for(let i = 0; i < cars.length; i++)
    {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if(i != 0) NeuralNetwork.mutate(cars[i].brain, 0.1);
    }
}

animate(10);

/**
 * @param {number} time
 * @returns {void}
 */
function animate(time)
{
    traffic.forEach(t => t.update(road.borders, []));

    cars.forEach(car => car.update(road.borders, traffic));
    // fitness function
    bestCar = cars.find(c => c.y === Math.min(...cars.map(c => c.y)));

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.75);

    road.draw(carCtx, "white");

    carCtx.globalAlpha = 0.2;
    cars.forEach(car => car.draw(carCtx, false));
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true);

    for(let i= 0; i < traffic.length; i++)
    {
        traffic[i].draw(carCtx, "red");
    }

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate)
}

/**
 * creates cars
 * @param {number} N 
 * @returns {Car[]}
 */
function generateCars(N)
{
    /** @type {Car[]} */
    const cars = [];
    for (let i = 1; i <= N; i++)
    {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, ControlType.AI, 3, "blue"));
    }

    return cars;
}

function save() 
{
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard()
{
    localStorage.removeItem("bestBrain");
}