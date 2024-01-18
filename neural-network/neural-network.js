'use strict';

import { Level } from "./level.js";
import { lerp } from "../utils/utils.js";

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

    /**
     * randomizes the neural network by the given amount
     * amount = 1 -> randomizes the network
     * amount = 0.1 -> randomizes the network with a 10% chance
     * @param {NeuralNetwork} network 
     * @param {number} amount 
     */
    static mutate(network, amount = 1)
    {
        network.levels.forEach(level => 
            {
                for(let i = 0; i < level.biases.length; i++)
                {
                    level.biases[i] = lerp
                    (
                        level.biases[i],
                        Math.random() * 2 - 1,
                        amount
                    );
                }

                for(let i = 0; i < level.weights.length; i++)
                {
                    for(let j = 0; j < level.weights[i].length; j++)
                    {
                        level.weights[i][j] = lerp
                        (
                            level.weights[i][j],
                            Math.random() * 2 - 1,
                            amount
                        );
                    }
                }
        });
    }
}
