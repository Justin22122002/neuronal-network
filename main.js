'use strict'

import {Car} from './models/car.js';

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
canvas.width = 200;

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

/** @type {Car} */
const car = new Car(100, 100, 30, 50);

animate();

/**
 * @returns {void}
 */
function animate()
{
    canvas.height = window.innerHeight;
    car.update();
    car.draw(ctx);
    requestAnimationFrame(animate)
}

