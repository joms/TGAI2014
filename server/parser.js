

var parser = function (data, created) {
        if (created == true) {
                console.log ("map saved")

        } 

        else {
        var localdata   = String(data);
        var n                   = localdata.indexOf("MAP");
        var xSize               = parseInt(localdata.charAt(n+4));
        var ySize               = parseInt(localdata.charAt(n+6));
 
        n                       = localdata.indexOf("STARTPOSITION");
        var xStart              = parseInt(localdata.charAt(n+14));
        var yStart              = parseInt(localdata.charAt(n+16));
        var mapdata     = [xSize,ySize, xStart, yStart]
        var map                 = new Array(xSize);
 
        for (var i = 0; i < ySize; i++) {
                map[i] = new Array(ySize);
        }
 
        var x = 0
        var y = 0
        n = localdata.indexOf("+")
       
        for (var c=0; c < localdata.length; c++){
                var point = localdata.charAt(c)
               
                if (point == "+") {
                       
                        map[x][y] = "0"
                       
                        x++
                }
                 
                else if (point == "#") {
                        map[x][y] = "1"
                       
                        x++
                }      
                 
                else if (point == ".") {
                        map[x][y] = "2"
                       
                        x++
 
                }
                else {}
 
                if (x == xSize) {
                        y++
                        x = 0
                       
                }
 
        }
        var state = [mapdata, map]
        console.log (state)
        var mapcreated = true 
        return state
}

}



exports.parser = parser;
