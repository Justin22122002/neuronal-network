'use strict';

/**
 * Represents a neural network layer with position and dimensions.
 * @class
 * @classdesc
 */
export class Level 
{
    /**
     * Creates a new instance of the Level class.
     * @constructor
     * @param {number} inputCount - The number of input neurons.
     * @param {number} outputCount - The number of output neurons.
     */
    constructor(inputCount, outputCount) 
    {
        /** @member {Array} - Array to store input values. */
        this.inputs = new Array(inputCount);
        /** @member {Array} - Array to store output values. */
        this.outputs = new Array(outputCount);
        /** @member {Array} - Array to store biases for each output neuron. */
        this.biases = new Array(outputCount);

        /** @member {[][]} - 2D array to store weights connecting input and output neurons. */
        this.weights = [];

        for (let i = 0; i < inputCount; i++) 
        {
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this);
    }

    /**
     * Private method to randomize values for inputs, outputs, and biases.
     * @private
     * @param {Level} level - The Level instance to randomize.
     */
    static #randomize(level) 
    {
        for (let i = 0; i < level.inputs.length; i++) 
        {
            for (let j = 0; j < level.outputs.length; j++) 
            {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let i = 0; i < level.biases.length; i++) 
        {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    /**
     * Performs feedforward computation for the neural network layer with the 'HYPERPLANE EQUATION'
     * @param {Array<number>} givenInputs - The input values for the layer.
     * @param {Level} level - The Level instance on which to perform feedforward.
     * @returns {Array} - The output values of the layer after feedforward.
     */
    static feedForward(givenInputs, level) 
    {
        for (let i = 0; i < level.inputs.length; i++) 
        {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) 
        {
            /** @type {number} */
            let sum = 0;

            for (let j = 0; j < level.inputs.length; j++)
             {
                sum += level.inputs[j] * level.weights[j][i];
            }

            /** Activates the neuron based on the sum, with value 1 or 0. */
            if (sum > level.biases[i]) // other way: sum + level.biases[i] > 0
             {
                level.outputs[i] = 1;
            } 
            else 
            {
                level.outputs[i] = 0;
            }
        }

        return level.outputs;
    }
}
