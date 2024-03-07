import {Graph} from "../math/graph.ts";
import {Envelope} from "../primitives/envelope.ts";
import {Polygon} from "../primitives/polygon.ts";
import {Segment} from "../primitives/segment.ts";
import {Point} from "../primitives/point.ts";
import {add, distance, lerp, scale} from "../math/utils.ts";
import {Building} from "../items/building.ts";
import {Tree} from "../items/tree.ts";

export class World
{
    private _envelopes: Envelope[];
    private _roadBorders: Segment[];
    private _buildings: Building[] = [];
    private _trees: Tree[] = [];
    constructor
    (
        private graph: Graph,
        private roadWidth = 100,
        private roadRoundness = 10,
        private buildingWidth = 150,
        private buildingMinLength = 150,
        private spacing = 50,
        private treeSize = 160
    )
    {
        this._envelopes = [];
        this._roadBorders = [];

        this.generate();
    }

    generate(): void
    {
        this._envelopes.length = 0;
        for (const seg of this.graph.segments)
        {
            this._envelopes.push
            (
                new Envelope(seg, this.roadWidth, this.roadRoundness)
            );
        }

        this._roadBorders = Polygon.union(this._envelopes.map((e: Envelope) => e.poly));
        this._buildings = this.generateBuildings();
        this._trees = this.generateTrees();
    }

    private generateTrees() : Tree[]
    {
        const points: Point[] = [
            ...this.roadBorders.map((s: Segment) => [s.p1, s.p2]).flat(),
            ...this.buildings.map((b: Building) => b.base.points).flat()
        ];
        const left: number = Math.min(...points.map((p: Point) => p.x));
        const right: number = Math.max(...points.map((p: Point) => p.x));
        const top: number = Math.min(...points.map((p: Point) => p.y));
        const bottom: number = Math.max(...points.map((p: Point) => p.y));

        const illegalPolys: Polygon[] = [
            ...this.buildings.map((b: Building) => b.base),
            ...this.envelopes.map((e: Envelope) => e.poly)
        ];

        const trees: Tree[] = [];
        let tryCount = 0;
        while (tryCount < 100)
        {
            const p = new Point(
                lerp(left, right, Math.random()),
                lerp(bottom, top, Math.random())
            );

            // check if tree inside or nearby building / road
            let keep = true;
            for (const poly of illegalPolys)
            {
                if (poly.containsPoint(p) || poly.distanceToPoint(p) < this.treeSize / 2)
                {
                    keep = false;
                    break;
                }
            }

            // check if tree too close to other trees
            if (keep)
            {
                for (const tree of trees)
                {
                    if (distance(tree.center, p) < this.treeSize)
                    {
                        keep = false;
                        break;
                    }
                }
            }

            // avoiding trees in the middle of nowhere
            if (keep)
            {
                let closeToSomething = false;
                for (const poly of illegalPolys)
                {
                    if (poly.distanceToPoint(p) < this.treeSize * 2)
                    {
                        closeToSomething = true;
                        break;
                    }
                }
                keep = closeToSomething;
            }

            if (keep)
            {
                trees.push(new Tree(p, this.treeSize));
                tryCount = 0;
            }
            tryCount++;
        }
        return trees;
    }

    private generateBuildings(): Building[]
    {
        const tmpEnvelopes: Envelope[] = [];
        for (const seg of this.graph.segments)
        {
            tmpEnvelopes.push(
                new Envelope(
                    seg,
                    this.roadWidth + this.buildingWidth + this.spacing * 2,
                    this.roadRoundness
                )
            );
        }

        const guides: Segment[] = Polygon.union(tmpEnvelopes.map((e: Envelope) => e.poly));

        for (let i = 0; i < guides.length; i++)
        {
            const seg: Segment = guides[i];
            if (seg.length() < this.buildingMinLength)
            {
                guides.splice(i, 1);
                i--;
            }
        }

        const supports: Segment[] = [];
        for (let seg of guides)
        {
            const len = seg.length() + this.spacing;
            const buildingCount = Math.floor(
                len / (this.buildingMinLength + this.spacing)
            );
            const buildingLength = len / buildingCount - this.spacing;

            const dir: Point = seg.directionVector();

            let q1: Point = seg.p1;
            let q2: Point = add(q1, scale(dir, buildingLength));
            supports.push(new Segment(q1, q2));

            for (let i = 2; i <= buildingCount; i++)
            {
                q1 = add(q2, scale(dir, this.spacing));
                q2 = add(q1, scale(dir, buildingLength));
                supports.push(new Segment(q1, q2));
            }
        }

        const bases: Polygon[] = [];
        for (const seg of supports)
        {
            bases.push(new Envelope(seg, this.buildingWidth).poly);
        }

        const eps = 0.001;
        for (let i = 0; i < bases.length - 1; i++)
        {
            for (let j = i + 1; j < bases.length; j++)
            {
                if
                (
                    bases[i].intersectsPoly(bases[j]) ||
                    bases[i].distanceToPoly(bases[j]) < this.spacing - eps
                )
                {
                    bases.splice(j, 1);
                    j--;
                }
            }
        }

        return bases.map((b: Polygon) => new Building(b));
    }

    draw(ctx: CanvasRenderingContext2D, viewPoint: Point): void
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

        const items: (Building | Tree)[] = [...this.buildings, ...this.trees];
        items.sort(
            (a: Building | Tree, b: Building | Tree) =>
                b.base.distanceToPoint(viewPoint) -
                a.base.distanceToPoint(viewPoint)
        );

        for (const item of items)
        {
            item.draw(ctx, viewPoint);
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

    get buildings(): Building[]
    {
        return this._buildings;
    }

    set buildings(value: Building[])
    {
        this._buildings = value;
    }

    get trees(): Tree[]
    {
        return this._trees;
    }

    set trees(value: Tree[])
    {
        this._trees = value;
    }
}