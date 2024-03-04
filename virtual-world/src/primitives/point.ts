export class Point
{
    constructor(private _x: number, private _y: number)
    {
    }

    equals(point: Point): boolean
    {
        return this._x == point._x && this._y == point._y;
    }

    draw(ctx: CanvasRenderingContext2D, size: number = 18, color: string = "black"): void
    {
        const rad: number = size / 2;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this._x, this._y, rad, 0, Math.PI * 2);
        ctx.fill();
    }

    get x(): number
    {
        return this._x;
    }

    set x(value: number)
    {
        this._x = value;
    }

    get y(): number
    {
        return this._y;
    }

    set y(value: number)
    {
        this._y = value;
    }
}