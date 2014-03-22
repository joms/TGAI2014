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

    return this.moves[m];
}

navigator.prototype.Random = function()
{
    return this.moves[Math.floor(Math.random()* 4)];
}

navigator.prototype.NextTile = function(num, flee)
{
    var p = this.path[num];
    var m = this.map[p.x][p.y];
    switch(m)
    {
        case 9:
            return "ROCK";
        case 1:
            return "GRASS";
        case 0:
            return "WALL";
        default:
            return "UNKOWN";
    }
}

navigator.prototype.Opposite = function(move)
{
    var moves = [
        "RIGHT\n",
        "LEFT\n",
        "DOWN\n",
        "UP\n"
    ];

    switch(move)
    {
        case "RIGHT\n":
            return this.moves[1];
        case "LEFT\n":
            return this.moves[0];
        case "DOWN\n":
            return this.moves[3];
        case "UP\n":
            return this.moves[2];
    }
}

navigator.prototype.update = function(x, y, i)
{
    this.map[x][y] = i;
}

