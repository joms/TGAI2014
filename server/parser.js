exports.ParseMap = function (data)
{
/**
* Sorry to say, but this must be reimplemented
* 
    var map = new Array(data.height)

    for (var i = 0; i < data.players.length; i++){
        pld[i] = lineDistance (data.players[i], data)
        console.log ("Player " + i + ": " + data.players[i].x + " " + data.players[i].y + " Distance "+ pld[i])
    }
**/

    var map = [];

    for (var i = 0; i < data.length; i++)
    {
        var t = [];
        for (var j = 0; j < data[i].length; j++)
        {
            t.push(Weight(data[i][j]));
        }
        map.push(t);
    }

    return map;
}

function Weight(point)
{
    var weight = { wall: 0, spawn: 1, grass: 1, rock: 10};

    if (point == "+") {
        return weight.wall;
    }
    else if (point == "#") {
        return weight.rock;
    }
    else if (point == ".") {
        return weight.grass;
    }
    else if (point == "_") {
        return weight.spawn;
    }
    else if (point == " ") {
        return weight.grass;
    }
}

function lineDistance( point1, point2 )
{
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt( xs + ys );
}
