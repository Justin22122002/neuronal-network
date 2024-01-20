/**
 * Represents a neural network layer with position and dimensions.
 */
export class Level
{
    /** Array to store input values. */
    public inputs: number[];
    /** Array to store output values. */
    public outputs: number[];
    /** Array to store biases for each output neuron. */
    public biases: number[];
    /** 2D array to store weights connecting input and output neurons. */
    public weights: number[][];

    /**
     * Creates a new instance of the Level class.
     * @constructor
     * @param {number} inputCount - The number of input neurons.
     * @param {number} outputCount - The number of output neurons.
     */
    constructor(inputCount: number, outputCount: number)
    {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);
        this.weights = [];

        for (let i = 0; i < inputCount; i++)
        {
            this.weights[i] = new Array(outputCount);
        }

        Level.randomize(this);
    }

    /**
     * Private method to randomize values for inputs, outputs, and biases.
     * @private
     * @param level - The Level instance to randomize.
     */
    private static randomize(level: Level): void
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
     * Performs feedforward computation for the neural network layer with the 'HYPERPLANE EQUATION'.
     * @param givenInputs - The input values for the layer.
     * @param level - The Level instance on which to perform feedforward.
     * @returns - The output values of the layer after feedforward.
     */
    public static feedForward(givenInputs: number[], level: Level): number[]
    {
        for (let i = 0; i < level.inputs.length; i++)
        {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++)
        {
            let sum = 0;

            for (let j = 0; j < level.inputs.length; j++)
            {
                sum += level.inputs[j] * level.weights[j][i];
            }

            /** Activates the neuron based on the sum, with value 1 or 0. */
            if (sum > level.biases[i])
            {
                level.outputs[i] = 1;
            } else
            {
                level.outputs[i] = 0;
            }
        }

        return level.outputs;
    }
}
