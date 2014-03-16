module.exports = navigator;

function navigator(path, map)
{
    this.path = path;
    this.map = map;
    this.moves = [
        "LEFT\n",
        "RIGHT\n",
        "UP\n",
        "DOWN\n"
    ];
}

navigator.prototype.move = function(num)
{
    var p = this.path[num];

    console.log("X  Y");
    console.log(p.parent.x +", "+p.parent.y);
    console.log(p.x +", "+p.y);

   var m;

    if (p.x == p.parent.x)
    {
        console.log("Vertical move");
        if (p.y - 1 == p.parent.y) // Vertical move
        {
            m = 2; // UP
        } else {
            m = 3; // DOWN
        }
    } else {
        console.log("Horizontal move");
        if (p.x - 1 == p.parent.x) // Horizontal move
        {
            m = 0; // LEFT
        } else {
            m = 1; // RIGHT
        }
    }

    this.update(p.x, p.y, num+10);
    return this.moves[m];
}

navigator.prototype.update = function(x, y, i)
{
    this.map[x][y] = i;
}