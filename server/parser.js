exports.CalcDist = function (players, you)
{
    var pld = new Array(players.length)

    for (var i = 0; i < players.length; i++){
        pld[i] = lineDistance (players[i], you)
    }

    Array.min = function( array ){
        return Math.min.apply( Math, array );
    };

    var result = pld
    pld = null

    return (Array.min(result))
}



exports.ParseMap = function (data, flee)
{
    this.flee = flee;
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
        if (this.flee == true)
            return 0;
        else
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
