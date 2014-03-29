/**
 * Parses the map to a point-based system.
 *
 * If flee is set to true, the weighting-function will
 * treat rocks as non-walkable
 */
exports.ParseMap = function (data, fear)
{
    var map = [];

    for (var i = 0; i < data.length; i++)
    {
        var t = [];
        for (var j = 0; j < data[i].length; j++)
        {
            t.push(Weight(data[i][j], fear));
        }
        map.push(t);
    }
    //console.log("In ParseMap")
    return map;
}

/**
 * Weights each point according to whatever value we have
 * defined for that point-type.
 */
function Weight(point, f)
{
    var weight = { wall: 0, walkable: 1, rock: 100};

    if (point == "+") {
        return weight.wall;
    }
    else if (point == "#") {
        if (f == false)
        {
            return weight.rock;
        } else {
            return weight.wall;
        }
    }
    else if (point == ".") {
        return weight.walkable;
    }
}

/**
 * Calculates the distance from you to all the players
 */
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

/**
 * Returns the distance from one {x: x, y: y} to another.
 */
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
