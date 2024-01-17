'use strict';

import { Level } from "./level.js";

/**
 * @class
 * @classdesc
 */
export class NeuralNetwork
{
    /**
     * @constructor
     * @param {number[]} neuronCounts 
     */
    constructor(neuronCounts)
    {
        /** @member {Level[]} */
        this.levels = [];

        for (let i = 0; i < neuronCounts.length - 1; i++) 
        {
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
        }
    }

    /**
     * @param {number[]} givenInputs 
     * @param {NeuralNetwork} network 
     * @returns 
     */
    static feedForward(givenInputs, network)
    {
        /** @type {Array} */
        let outputs = Level.feedForward(givenInputs, network.levels[0]);

        for(let i = 1; i < network.levels.length; i++)
        {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }

        return outputs;
    }
}
