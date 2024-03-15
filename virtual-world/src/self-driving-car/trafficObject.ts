import {Point} from "../primitives/point.ts";

export abstract class TrafficObject
{
    public polygon: Point[];

    protected constructor()
    {
        this.polygon = [];
    }
}