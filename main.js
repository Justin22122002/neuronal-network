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
const car = new Car(road.getLaneCenter(1), 100, 30, 50);

animate();

/**
 * @returns {void}
 */
function animate()
{
    car.update(road.borders);

    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.75);

    drawObject(road, ctx);
    drawObject(car, ctx);

    ctx.restore()
    requestAnimationFrame(animate)
}

/**
 * @param {Drawable} object
 * @param {CanvasRenderingContext2D} ctx
 */
function drawObject(object, ctx)
{
    object.draw(ctx)
}

