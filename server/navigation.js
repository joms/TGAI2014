module.exports = navigator;

function navigator(path, map)
{
    this.path = path;
    this.map = map;
    this.moves = [
        "RIGHT\n",
        "LEFT\n",
        "DOWN\n",
        "UP\n"
    ];
}

navigator.prototype.move = function(num)
{
    var p = this.path[num];
/*    console.log (num)
    console.log("X  Y");
    console.log(p.parent.y +", "+p.parent.x); // Seems like x and y needs på be flipped ... yes, it hurts
    console.log(p.y +", "+p.x);*/

    var m;

    if (p.y == p.parent.y)
    {
        //console.log("Vertical move");
        if (p.x - 1 == p.parent.x) // Vertical move
        {
            m = 2; // Down
        } else {
            m = 3; // Up
        }
    } else {
        //console.log("Horizontal move");
        if (p.y - 1 == p.parent.y) // Horizontal move
        {
            m = 0; // right
        } else {
            m = 1; // left
        }
    }

    this.update(p.x, p.y, num + 10);
    return this.moves[m];
}

navigator.prototype.update = function(x, y, i)
{
    this.map[x][y] = i;
}

