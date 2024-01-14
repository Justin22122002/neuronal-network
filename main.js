'use strict'

import {Car} from './models/car.js';
import {Road} from "./models/road.js";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
canvas.width = 200;

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");
/** @type {Road} */
const road = new Road(canvas.width / 2, canvas.width * 0.9);
/** @type {Car} */
const car = new Car(road.getLaneCenter(1), 100, 30, 50, "KEYS", 3);
/** @type {Car[]} */
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 1)
]

animate();

/**
 * @returns {void}
 */
function animate()
{
    for(let i= 0; i < traffic.length; i++)
    {
        traffic[i].update(road.borders, []);
    }

    car.update(road.borders, traffic);

    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.75);

    drawObject(road, ctx, "white");
    drawObject(car, ctx, "blue");

    for(let i= 0; i < traffic.length; i++)
    {
        traffic[i].draw(ctx, "red");
    }

    ctx.restore()
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

