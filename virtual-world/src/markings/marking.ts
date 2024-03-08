import {Point} from "../primitives/point.ts";
import {Segment} from "../primitives/segment.ts";
import {angle, translate} from "../math/utils.ts";
import {Envelope} from "../primitives/envelope.ts";
import {Polygon} from "../primitives/polygon.ts";
import {MarkingType} from "./markingType.ts";

export class Marking
{
    public support: Segment;
    public poly: Polygon;
    public type: MarkingType = MarkingType.MARKING;

    constructor
    (
        public center: Point,
        public directionVector: Point,
        public width: number,
        public height: number
    )
    {
        this.support = new Segment
        (
            translate(center, angle(directionVector), height / 2),
            translate(center, angle(directionVector), -height / 2)
        );
        this.poly = new Envelope(this.support, width, 0).poly;
    }

    static async load(info: Marking): Promise<Marking>
    {
        const point = new Point(info.center.x, info.center.y);
        const dir = new Point(info.directionVector.x, info.directionVector.y);

        switch (info.type)
        {
            case MarkingType.CROSSING:
                const CrossingModule = await import("./crossing.ts");
                return new CrossingModule.Crossing(point, dir, info.width, info.height);

            case MarkingType.LIGHT:
                const LightModule = await import("./light.ts");
                return new LightModule.Light(point, dir, info.width, info.height);

            case MarkingType.MARKING:
                return new Marking(point, dir, info.width, info.height);

            case MarkingType.PARKING:
                const ParkingModule = await import("./parking.ts");
                return new ParkingModule.Parking(point, dir, info.width, info.height);

            case MarkingType.START:
                const StartModule = await import("./start.ts");
                return new StartModule.Start(point, dir, info.width, info.height);

            case MarkingType.STOP:
                const StopModule = await import("./stop.ts");
                return new StopModule.Stop(point, dir, info.width, info.height);

            case MarkingType.TARGET:
                const TargetModule = await import("./target.ts");
                return new TargetModule.Target(point, dir, info.width, info.height);

            case MarkingType.YIELD:
                const YieldModule = await import("./yield.ts");
                return new YieldModule.Yield(point, dir, info.width, info.height);

            default:
                throw new Error("Unknown MarkingType");
        }
    }

    draw(ctx: CanvasRenderingContext2D): void
    {
        this.poly.draw(ctx);
    }
}