

var parser = function (data, created) { 
        if (data.type == "status update") {

                var localdata
                var weight = { bad: 999, grass: 1, rock: 10}

                var map = new Array(data.height)
                for (var i = 0; i < data.width; i++){
                        map[i] = new Array (data.width)
                }
                
                var x = 0 
                var y = 0 

                for (var i = 0; i < data.map.length; i++){
                        y = i
                        localdata = String(data.map[i])
                        for (var j = 0; j < data.width; j++) {
                                x = j
                                var point = localdata.charAt(j)

                                if (point == "+") {
                                        map[x][y] = weight.bad
                                }
                                else if (point == "#") {
                                        map[x][y] = weight.rock
                                }
                                else if (point == ".") {
                                        map[x][y] = weight.grass
                                }

                        }

                }

                console.log(map)
        }
}

exports.parser = parser;
