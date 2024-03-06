import {Graph} from "../math/graph.ts";
import {Envelope} from "../primitives/envelope.ts";
import {Polygon} from "../primitives/polygon.ts";
import {Segment} from "../primitives/segment.ts";

export class World
{
    private _envelopes: Envelope[];
    private _roadBorders: Segment[];
    constructor
    (
        private graph: Graph,
        private roadWidth = 100,
        private roadRoundness = 10
    )
    {
        this._envelopes = [];
        this._roadBorders = [];

        this.generate();
    }

    generate()
    {
        this._envelopes.length = 0;
        for (const seg of this.graph.segments)
        {
            this._envelopes.push
            (
                new Envelope(seg, this.roadWidth, this.roadRoundness)
            );
        }

        this._roadBorders = Polygon.union(this._envelopes.map((e) => e.poly));
    }

    draw(ctx: CanvasRenderingContext2D)
    {
        for (const env of this._envelopes)
        {
            env.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
        }
        for (const seg of this.graph.segments)
        {
            seg.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
        }
        for (const seg of this._roadBorders)
        {
            seg.draw(ctx, { color: "white", width: 4 });
        }
    }


    get envelopes(): Envelope[]
    {
        return this._envelopes;
    }

    set envelopes(value: Envelope[])
    {
        this._envelopes = value;
    }

    get roadBorders(): Segment[]
    {
        return this._roadBorders;
    }

    set roadBorders(value: Segment[])
    {
        this._roadBorders = value;
    }
}