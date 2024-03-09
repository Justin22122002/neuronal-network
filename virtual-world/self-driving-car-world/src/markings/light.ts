import {Marking} from "./marking.ts";
import {MarkingType} from "./markingType.ts";
import {Point} from "../primitives/point.ts";
import {add, lerp2D, perpendicular, scale} from "../math/utils.ts";
import {Segment} from "../primitives/segment.ts";

export class Light extends Marking
{
    public state: string;
    public border: Segment;
    constructor
    (
        center: Point,
        directionVector: Point,
        width: number,
        height: number = 18
    )
    {
        super(center, directionVector, width, height);

        this.state = "off";
        this.border = this.poly.segments[0];
        this.type = MarkingType.LIGHT;
    }

    draw(ctx: CanvasRenderingContext2D): void 
    {
        const perp = perpendicular(this.directionVector);
        const line = new Segment(
            add(this.center, scale(perp, this.width / 2)),
            add(this.center, scale(perp, -this.width / 2))
        );

        const green: Point = lerp2D(line.p1, line.p2, 0.2);
        const yellow: Point = lerp2D(line.p1, line.p2, 0.5);
        const red: Point = lerp2D(line.p1, line.p2, 0.8);

        new Segment(red, green).draw(ctx,
        {
            width: this.height,
            cap: "round"
        });

        green.draw(ctx, { size: this.height * 0.6, color: "#060" });
        yellow.draw(ctx, { size: this.height * 0.6, color: "#660" });
        red.draw(ctx, { size: this.height * 0.6, color: "#600" });

        switch (this.state)
        {
            case "green":
                green.draw(ctx, { size: this.height * 0.6, color: "#0F0" });
                break;
            case "yellow":
                yellow.draw(ctx, { size: this.height * 0.6, color: "#FF0" });
                break;
            case "red":
                red.draw(ctx, { size: this.height * 0.6, color: "#F00" });
                break;
        }
    }
}