/*exports.parse = function (data) {
    var localdata;
    var weight = { bad: 0, spawn: 10, grass: 10, rock: 1};

    var map = new Array(data.height)
    for (var i = 0; i < data.width; i++){
        map[i] = new Array (data.width)
    }

    var x = 0;
    var y = 0;

    for (var i = 0; i < data.length; i++){
        y = i
        localdata = String(data[i])
        for (var j = 0; j < data.width; j++) {
            x = j
            var point = localdata.charAt(j)

            if (point == "+") {
                map[x][y] = weight.bad;
            }
            else if (point == "#") {
                map[x][y] = weight.rock;
            }
            else if (point == ".") {
                map[x][y] = weight.grass;
            }
            else if (point == "_") {
                map[x][y] = weight.spawn;
            }
        }
    }
    console.log(map);
    return {map: map};
}*/

exports.parse = function (data)
{
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
    else if (point == "") {
        return weight.grass;
    }
}