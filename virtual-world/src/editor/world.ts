import {Graph} from "../math/graph.ts";
import {Envelope} from "../primitives/envelope.ts";
import {Polygon} from "../primitives/polygon.ts";
import {Segment} from "../primitives/segment.ts";
import {Point} from "../primitives/point.ts";
import {add, distance, getNearestPoint, lerp, scale} from "../math/utils.ts";
import {Building} from "../items/building.ts";
import {Tree} from "../items/tree.ts";
import {Marking} from "../markings/marking.ts";
import {Light} from "../markings/light.ts";

interface ControlCenter
{
    x: number;
    y: number;
    lights: Light[];
    ticks: number;
}

export class World
{
    private _envelopes: Envelope[] = [];
    private _roadBorders: Segment[] = [];
    private _buildings: Building[] = [];
    private _trees: Tree[] = [];
    private _markings: Marking[] = [];
    private _frameCount: number = 0;
    private _laneGuides: Segment[] = [];
    constructor
    (
        private _graph: Graph,
        private _roadWidth = 100,
        private _roadRoundness = 10,
        private _buildingWidth = 150,
        private _buildingMinLength = 150,
        private _spacing = 50,
        private _treeSize = 160
    )
    {
        this.generate();
    }

    generate(): void
    {
        this._envelopes.length = 0;
        for (const seg of this._graph.segments)
        {
            this._envelopes.push
            (
                new Envelope(seg, this._roadWidth, this._roadRoundness)
            );
        }

        this._roadBorders = Polygon.union(this._envelopes.map((e: Envelope) => e.poly));
        this._buildings = this.generateBuildings();
        this._trees = this.generateTrees();

        this.laneGuides.length = 0;
        this.laneGuides.push(...this.generateLaneGuides());
    }

    private generateLaneGuides(): Segment[]
    {
        const tmpEnvelopes: Envelope[] = [];
        for (const seg of this._graph.segments)
        {
            tmpEnvelopes.push(
                new Envelope(seg, this._roadWidth / 2, this._roadRoundness)
            );
        }

        const segments: Segment[] = Polygon.union(tmpEnvelopes.map((e: Envelope) => e.poly));
        return segments;
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
                if (poly.containsPoint(p) || poly.distanceToPoint(p) < this._treeSize / 2)
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
                    if (distance(tree.center, p) < this._treeSize)
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
                    if (poly.distanceToPoint(p) < this._treeSize * 2)
                    {
                        closeToSomething = true;
                        break;
                    }
                }
                keep = closeToSomething;
            }

            if (keep)
            {
                trees.push(new Tree(p, this._treeSize));
                tryCount = 0;
            }
            tryCount++;
        }
        return trees;
    }

    private generateBuildings(): Building[]
    {
        const tmpEnvelopes: Envelope[] = [];
        for (const seg of this._graph.segments)
        {
            tmpEnvelopes.push(
                new Envelope(
                    seg,
                    this._roadWidth + this._buildingWidth + this._spacing * 2,
                    this._roadRoundness
                )
            );
        }

        const guides: Segment[] = Polygon.union(tmpEnvelopes.map((e: Envelope) => e.poly));

        for (let i = 0; i < guides.length; i++)
        {
            const seg: Segment = guides[i];
            if (seg.length() < this._buildingMinLength)
            {
                guides.splice(i, 1);
                i--;
            }
        }

        const supports: Segment[] = [];
        for (let seg of guides)
        {
            const len = seg.length() + this._spacing;
            const buildingCount = Math.floor(
                len / (this._buildingMinLength + this._spacing)
            );
            const buildingLength = len / buildingCount - this._spacing;

            const dir: Point = seg.directionVector();

            let q1: Point = seg.p1;
            let q2: Point = add(q1, scale(dir, buildingLength));
            supports.push(new Segment(q1, q2));

            for (let i = 2; i <= buildingCount; i++)
            {
                q1 = add(q2, scale(dir, this._spacing));
                q2 = add(q1, scale(dir, buildingLength));
                supports.push(new Segment(q1, q2));
            }
        }

        const bases: Polygon[] = [];
        for (const seg of supports)
        {
            bases.push(new Envelope(seg, this._buildingWidth).poly);
        }

        const eps = 0.001;
        for (let i = 0; i < bases.length - 1; i++)
        {
            for (let j = i + 1; j < bases.length; j++)
            {
                if
                (
                    bases[i].intersectsPoly(bases[j]) ||
                    bases[i].distanceToPoly(bases[j]) < this._spacing - eps
                )
                {
                    bases.splice(j, 1);
                    j--;
                }
            }
        }

        return bases.map((b: Polygon) => new Building(b));
    }

    private getIntersections(): Point[]
    {
        const subset: Point[] = [];
        for (const point of this._graph.points)
        {
            let degree = 0;
            for (const seg of this._graph.segments)
            {
                if (seg.includes(point))
                {
                    degree++;
                }
            }

            if (degree > 2)
            {
                subset.push(point);
            }
        }
        return subset;
    }

    private updateLights(): void
    {
        const lights: Marking[] = this.markings.filter((m: Marking) => m instanceof Light);
        const controlCenters: ControlCenter[] = [];

        for (const light of lights)
        {
            const point: Point | null = getNearestPoint(light.center, this.getIntersections());
            if (!point) continue;

            let controlCenter = controlCenters.find((c) => c.x === point.x && c.y === point.y);

            if (!controlCenter)
            {
                if (light instanceof Light)
                {
                    controlCenter = { x: point.x, y: point.y, lights: [light], ticks: 0 };
                    controlCenters.push(controlCenter);
                }
            }
            else
            {
                if (light instanceof Light)
                {
                    controlCenter.lights.push(light);
                }
            }
        }

        const greenDuration = 2,
            yellowDuration = 1;

        for (const center of controlCenters)
        {
            center.ticks = center.lights.length * (greenDuration + yellowDuration);
        }

        const tick: number = Math.floor(this.frameCount / 60);

        for (const center of controlCenters)
        {
            const cTick: number = tick % center.ticks;
            const greenYellowIndex: number = Math.floor(
                cTick / (greenDuration + yellowDuration)
            );

            const greenYellowState: "green" | "yellow" =
                cTick % (greenDuration + yellowDuration) < greenDuration
                    ? "green"
                    : "yellow";

            for (let i = 0; i < center.lights.length; i++)
            {
                if (i === greenYellowIndex)
                {
                    center.lights[i].state = greenYellowState;
                } else {
                    center.lights[i].state = "red";
                }
            }
        }

        this.frameCount++;
    }

    draw(ctx: CanvasRenderingContext2D, viewPoint: Point): void
    {
        this.updateLights();

        for (const env of this._envelopes)
        {
            env.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
        }
        for (const seg of this._graph.segments)
        {
            seg.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
        }
        for (const seg of this._roadBorders)
        {
            seg.draw(ctx, { color: "white", width: 4 });
        }
        for (const marking of this.markings)
        {
            marking.draw(ctx);
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

    get markings(): Marking[]
    {
        return this._markings;
    }

    set markings(value: Marking[])
    {
        this._markings = value;
    }


    get frameCount(): number
    {
        return this._frameCount;
    }

    set frameCount(value: number)
    {
        this._frameCount = value;
    }

    get laneGuides(): Segment[]
    {
        return this._laneGuides;
    }

    set laneGuides(value: Segment[])
    {
        this._laneGuides = value;
    }


    get graph(): Graph
    {
        return this._graph;
    }

    set graph(value: Graph)
    {
        this._graph = value;
    }

    get roadWidth(): number
    {
        return this._roadWidth;
    }

    set roadWidth(value: number)
    {
        this._roadWidth = value;
    }

    get roadRoundness(): number
    {
        return this._roadRoundness;
    }

    set roadRoundness(value: number)
    {
        this._roadRoundness = value;
    }

    get buildingWidth(): number
    {
        return this._buildingWidth;
    }

    set buildingWidth(value: number)
    {
        this._buildingWidth = value;
    }

    get buildingMinLength(): number
    {
        return this._buildingMinLength;
    }

    set buildingMinLength(value: number)
    {
        this._buildingMinLength = value;
    }

    get spacing(): number
    {
        return this._spacing;
    }

    set spacing(value: number)
    {
        this._spacing = value;
    }

    get treeSize(): number
    {
        return this._treeSize;
    }

    set treeSize(value: number)
    {
        this._treeSize = value;
    }
}