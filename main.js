'use strict'

import {Car} from './models/car.js';
import {Road} from "./models/road.js";
import {Drawable} from './utils/drawable.js';
import {ControlType} from "./models/coordinates.js";
import {Visualizer} from "./neural-network/visualizer.js";

const carCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("carCanvas"));
carCanvas.width = 200;

const networkCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("networkCanvas"));
networkCanvas.width = 300;

/** @type {CanvasRenderingContext2D | null} */
const carCtx = carCanvas.getContext("2d");
/** @type {CanvasRenderingContext2D | null} */
const networkCtx = networkCanvas.getContext("2d");
/** @type {Road} */
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
/** @type {Car} */
const car = new Car(road.getLaneCenter(1), 100, 30, 50, ControlType.AI, 3);
/** @type {Car[]} */
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, ControlType.DUMMY, 1)
]

animate(10);

/**
 * @param {number} time
 * @returns {void}
 */
function animate(time)
{
    for(let i= 0; i < traffic.length; i++)
    {
        traffic[i].update(road.borders, []);
    }

    car.update(road.borders, traffic);

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -car.y + carCanvas.height * 0.75);

    drawObject(road, carCtx, "white");
    drawObject(car, carCtx, "blue");

    for(let i= 0; i < traffic.length; i++)
    {
        traffic[i].draw(carCtx, "red");
    }

    carCtx.restore();

    networkCtx.lineDashOffset = time / 50;
    Visualizer.drawNetwork(networkCtx, car.barin);
    requestAnimationFrame(animate)
}

/**
 * @param {Drawable} object
 * @param {CanvasRenderingContext2D} ctx
 * @param {string | CanvasGradient | CanvasPattern} color
 */
function drawObject(object, ctx, color)
{
    object.draw(ctx, color)
}

