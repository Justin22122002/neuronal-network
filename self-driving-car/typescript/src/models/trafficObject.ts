import {Coordinates} from "./coordinates.ts";

export abstract class TrafficObject
{
    public polygon: Coordinates[];

    protected constructor()
    {
        this.polygon = [];
    }
}