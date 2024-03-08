import {Point} from "../primitives/point.ts";
import {Marking} from "./marking.ts";
import {MarkingType} from "./markingType.ts";
import {angle} from "../math/utils.ts";

export class Start extends Marking
{
    public readonly img: HTMLImageElement;

    constructor
    (
        center: Point,
        directionVector: Point,
        width: number,
        height: number
    )
    {
        super(center, directionVector, width, height);

        this.img = new Image();
        this.img.src = "./src/car.png";
        this._type = MarkingType.START;
    }

    draw(ctx: CanvasRenderingContext2D): void
    {
        ctx.save();
        ctx.translate(this._center.x, this._center.y);
        ctx.rotate(angle(this._directionVector) - Math.PI / 2);

        ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);

        ctx.restore();
    }
}