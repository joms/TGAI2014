parse = exports.parser;

var parser = function (data) {
    var localdata;
    var weight = { bad: 0, spawn: 10, grass: 10, rock: 1};

    var map = new Array(data.height)
    for (var i = 0; i < data.width; i++){
        map[i] = new Array (data.width)
    }

    var x = 0;
    var y = 0;

    for (var i = 0; i < data.map.length; i++){
        y = i
        localdata = String(data.map[i])
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

    return {map: map};
}
