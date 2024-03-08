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
    public envelopes: Envelope[] = [];
    public roadBorders: Segment[] = [];
    public buildings: Building[] = [];
    public trees: Tree[] = [];
    public markings: Marking[] = [];
    public frameCount: number = 0;
    public laneGuides: Segment[] = [];
    public zoom: number = 1;
    public offset: Point = new Point(0, 0);
    constructor
    (
        public graph: Graph,
        public roadWidth = 100,
        public roadRoundness = 10,
        public buildingWidth = 150,
        public buildingMinLength = 150,
        public spacing = 50,
        public treeSize = 160
    )
    {
        this.generate();
    }

    static async load(info: World): Promise<World>
    {
        const world = new World(new Graph());
        world.graph = Graph.load(info.graph);
        world.roadWidth = info.roadWidth;
        world.roadRoundness = info.roadRoundness;
        world.buildingWidth = info.buildingWidth;
        world.buildingMinLength = info.buildingMinLength;
        world.spacing = info.spacing;
        world.treeSize = info.treeSize;
        world.envelopes = info.envelopes.map((e) => Envelope.load(e));
        world.roadBorders = info.roadBorders.map((b) => new Segment(b.p1, b.p2));
        world.buildings = info.buildings.map((e) => Building.load(e));
        world.trees = info.trees.map((t) => new Tree(t.center, info.treeSize));
        world.laneGuides = info.laneGuides.map((g) => new Segment(g.p1, g.p2));

        world.markings = await Promise.all(info.markings.map(async (m) => await Marking.load(m)));

        world.zoom = info.zoom;
        world.offset = info.offset;
        return world;
    }

    generate(): void
    {
        this.envelopes.length = 0;
        for (const seg of this.graph.segments)
        {
            this.envelopes.push
            (
                new Envelope(seg, this.roadWidth, this.roadRoundness)
            );
        }

        this.roadBorders = Polygon.union(this.envelopes.map((e: Envelope) => e.poly));
        this.buildings = this.generateBuildings();
        this.trees = this.generateTrees();

        this.laneGuides.length = 0;
        this.laneGuides.push(...this.generateLaneGuides());
    }

    private generateLaneGuides(): Segment[]
    {
        const tmpEnvelopes: Envelope[] = [];
        for (const seg of this.graph.segments)
        {
            tmpEnvelopes.push(
                new Envelope(seg, this.roadWidth / 2, this.roadRoundness)
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

    private getIntersections(): Point[]
    {
        const subset: Point[] = [];
        for (const point of this.graph.points)
        {
            let degree = 0;
            for (const seg of this.graph.segments)
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

        for (const env of this.envelopes)
        {
            env.draw(ctx, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
        }
        for (const seg of this.graph.segments)
        {
            seg.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
        }
        for (const seg of this.roadBorders)
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
}