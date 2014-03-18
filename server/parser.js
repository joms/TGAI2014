exports.parse = function (data) {
    console.log(data)
    var localdata;
    var weight = { bad: 0, spawn: 10, grass: 10, rock: 1};
    var pld = new Array()
    var map = new Array(data.height)
    for (var i = 0; i < data.width; i++){
        map[i] = new Array (data.width)
    }

    var x = 0;
    var y = 0;

    for (var i = 0; i < data.players.length; i++){
        pld[i] = lineDistance (data.players[i], data)
        console.log ("Player " + i + ": " + data.players[i].x + " " + data.players[i].y + " Distance "+ pld[i])
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
            else if (point == " ") {
                map[x][y] = weight.grass;
            }
               
        }
    }
    return {map: map};
}