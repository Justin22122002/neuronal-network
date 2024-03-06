export class Point
{
    private _offset?: number

    constructor
    (
        private _x: number,
        private _y: number,
    )
    {
    }

    equals(point: Point): boolean
    {
        return this._x == point.x && this._y == point.y;
    }

    draw(ctx: CanvasRenderingContext2D, { size = 18, color = "black", outline = false, fill = false } = {})
    {
        const rad = size / 2;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, rad, 0, Math.PI * 2);
        ctx.fill();

        if (outline)
        {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.arc(this.x, this.y, rad * 0.6, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (fill)
        {
            ctx.beginPath();
            ctx.arc(this.x, this.y, rad * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "yellow";
            ctx.fill();
        }
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


    get offset(): number | undefined
    {
        return this._offset;
    }

    set offset(value: number)
    {
        this._offset = value;
    }
}