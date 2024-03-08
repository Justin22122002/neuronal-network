import {Point} from "../primitives/point.ts";
import {Marking} from "./marking.ts";
import {angle} from "../math/utils.ts";

export class Start extends Marking
{
    private readonly img: HTMLImageElement;

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
    }

    draw(ctx: CanvasRenderingContext2D): void
    {
        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        ctx.rotate(angle(this.directionVector) - Math.PI / 2);

        ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);

        ctx.restore();
    }
}