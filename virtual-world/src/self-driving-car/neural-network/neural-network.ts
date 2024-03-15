import { Level } from "./level";
import {lerp} from "../../math/utils.ts";

export class NeuralNetwork
{
    public levels: Level[];

    constructor(neuronCounts: number[])
    {
        this.levels = [];

        for (let i = 0; i < neuronCounts.length - 1; i++)
        {
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
        }
    }

    /**
     * @param givenInputs
     * @param network
     * @returns
     */
    static feedForward(givenInputs: number[], network: NeuralNetwork): number[]
    {
        let outputs: number[] = Level.feedForward(givenInputs, network.levels[0]);

        for (let i = 1; i < network.levels.length; i++)
        {
            outputs = Level.feedForward(outputs, network.levels[i]);
        }

        return outputs;
    }

    /**
     * randomizes the neural network by the given amount
     * amount = 1 -> randomizes the network
     * amount = 0.1 -> randomizes the network with a 10% chance
     * @param network
     * @param amount
     */
    static mutate(network: NeuralNetwork, amount: number = 1): void
    {
        network.levels.forEach((level: Level) =>
        {
            for (let i = 0; i < level.biases.length; i++)
            {
                level.biases[i] = lerp
                (
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                );
            }

            for (let i = 0; i < level.weights.length; i++)
            {
                for (let j = 0; j < level.weights[i].length; j++)
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
