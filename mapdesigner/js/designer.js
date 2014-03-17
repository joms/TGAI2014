/**
 * 0 = Undestroyable wall
 * 1 = Destroyable wall
 * 2 = Grass
 *
 * X = Player start
 */

function MapDesigner(canvas)
{
    var canvas = canvas;
    var ctx = canvas.getContext('2d');

    var Map = [
        [0,0,0,0,0,0,0,0],
        [0,'X',2,1,1,1,1,0],
        [0,2,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,2,0],
        [0,1,1,1,1,2,'X',0],
        [0,0,0,0,0,0,0,0]
    ];

    var clickStart = {mouse: [0,0], tile: [0,0]};
    var mouseIsDown = false;

    function Draw()
    {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var tiles = [Map.length, Map[0].length];
        var spacing = 2;

        $('#map_width').val(tiles[1]);
        $('#map_height').val(tiles[0]);

        var w = canvas.width / tiles[1] - spacing;
        var h = canvas.height / tiles[0] - spacing;

        var offset1 = w / 4;
        var offset2 = (h / 4) * 2;

        // Handling colors and shapes according to whatever number's returned from map
        for (var i = 0; i < tiles[0]; i++){
            for (var  j= 0; j < tiles[1]; j++){
                if (Map[i][j] == 0)
                {
                    ctx.fillStyle = '#666';
                    ctx.fillRect(j * w + (j * spacing), i * h + (i * spacing), w, h);
                }
                else if (Map[i][j] == 1)
                {
                    ctx.fillStyle = '#CCC';
                    ctx.fillRect(j * w + (j * spacing), i * h + (i * spacing), w, h);
                }
                else if (Map[i][j] == 2)
                {
                    ctx.fillStyle = '#696';
                    ctx.fillRect(j * w + (j * spacing), i * h + (i * spacing), w, h);
                }
                else if (Map[i][j] == 'X')
                {
                    ctx.fillStyle = '#696';
                    ctx.fillRect(j * w + (j * spacing), i * h + (i * spacing), w, h);
                    ctx.fillStyle = '#33B5E5';
                    ctx.fillRect(j * w + (j * spacing) + offset1, i * h + (i * spacing) + offset1, w - offset2, h - offset2);
                }
            }
        }

        $('#map').text(JSON.stringify(Map));
    }

    /**
     * Scrolls through the tiles-array and sets the tile to the next component
     * @param e
     */
    function mouseClickHandler(e)
    {
        var clickedTile = FindTile(e.clientX, e.clientY);
        switch(Map[clickedTile.y][clickedTile.x])
        {
            case 0:
                Map[clickedTile.y][clickedTile.x] = 1;
                break;
            case 1:
                Map[clickedTile.y][clickedTile.x] = 2;
                break;
            case 2:
                Map[clickedTile.y][clickedTile.x] = 'X';
                break;
            default:
                Map[clickedTile.y][clickedTile.x] = 0;
        }

        Draw();
    }

    /**
     * Resets tile to wall
     * @param e
     */
    function mouseDoubleClickHandler(e)
    {
        var clickedTile = FindTile(e.clientX, e.clientY);
        if (Map[clickedTile.y][clickedTile.x] !== 0)
        {
            Map[clickedTile.y][clickedTile.x] = 0;
            Draw();
        }
    }

    /**
     * Returns the tile the specified coordinates in pixels, belongs to
     * @param x X-coordinate in pixels
     * @param y Y-coordinate in pixels
     * @returns {{x: Number, y: Number}}
     */
    function FindTile(x, y)
    {
        // Corrects coordinates according to canvas' size
        var rect = canvas.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;

        var squareX = Math.floor(x / canvas.width * Map[0].length);
        var squareY = Math.floor(y / canvas.height * Map.length);

        return {x: squareX, y: squareY};
    }

    /**
     * Updates map on trigger from designer
     * @param map
     * @constructor
     */
    this.Update = function(map)
    {
        var newMap;
        var canUpdate = true;

        try {
            newMap = JSON.parse(map);
        } catch (e) {
            canUpdate = false;
        }

        var tiles = [0, 1, 2, 'X'];

        if (typeof(newMap) === "object")
        {
            newMap.forEach(function(d){
                d.forEach(function(e){
                    if ($.inArray(e, tiles) == -1)
                    {
                        canUpdate = false;
                    }
                });
            });
        } else {
            canUpdate = false;
        }

        if (canUpdate)
        {
            $('#map_input').addClass('has-success');
            $('#map_input').removeClass('has-error');
            Map = newMap;
            Draw();
        } else {
            $('#map_input').removeClass('has-success');
            $('#map_input').addClass('has-error');
        }

    }

    /**
     * Updates size of the map
     * @param e
     * @constructor
     */
    this.UpdateSize = function(e)
    {
        if (e.id === "map_height")
        {
            if (e.value > Map.length)
            {
                var ml = e.value - Map.length;
                for (var i = 0; i < ml; i++)
                {
                    var l = parseInt($('#map_width').val());
                    var arr = Array(l+1).join('0').split('').map(parseFloat)
                    Map.push(arr);
                }
            }

            if (e.value < Map.length)
            {
                var n = Map.length - e.value;
                for (var i = 0; i < n; i++)
                {
                    Map.pop();
                }
            }
        }

        if (e.id === "map_width")
        {
            if (e.value > Map[0].length)
            {
                var n = e.value - Map[0].length;
                console.log(n);
                for (var i = 0; i < n; i++)
                {
                    $.each(Map, function(i, v){
                        v.push(0);
                    });
                }
            }

            if (e.value < Map[0].length)
            {
                var n = Map[0].length - e.value;
                for (var i = 0; i < n; i++)
                {
                    $.each(Map, function(i, v){
                        v.pop();
                    });
                }
            }
        }

        Draw();
    }

    /**
     * Clears map and sets it back to default
     */
    this.ClearMap = function()
    {
        Map = [
            [0,0,0,0,0,0,0,0],
            [0,'X',2,1,1,1,1,0],
            [0,2,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,2,0],
            [0,1,1,1,1,2,'X',0],
            [0,0,0,0,0,0,0,0]
        ];
        Draw();
    }

    canvas.ondblclick = function(e) { mouseDoubleClickHandler(e); }
    canvas.onclick = function(e) { mouseClickHandler(e); }

    Draw();
}