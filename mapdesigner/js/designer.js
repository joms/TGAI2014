/**
 * + = Undestroyable wall
 * # = Destroyable wall
 * . = Grass
 * _ = Spawn
 *
 */

function MapDesigner(canvas)
{
    var canvas = canvas;
    var ctx = canvas.getContext('2d');

    var Map = [
        '++++++++',
        '+_.####+',
        '+.#####+',
        '+######+',
        '+######+',
        '+#####.+',
        '+####._+',
        '++++++++'
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

        var spawns = [];

        //$('#map_input').val('');
        $('#map_input').text(tiles[0]+"x"+tiles[1]+"\n");

        // Handling colors and shapes according to whatever number's returned from map
        for (var i = 0; i < Map.length; i++){
            for (var  j= 0; j < Map[i].length; j++){
                if (Map[i][j] == '+')
                {
                    ctx.fillStyle = '#666';
                    ctx.fillRect(j * w + (j * spacing), i * h + (i * spacing), w, h);
                }
                else if (Map[i][j] == '#')
                {
                    ctx.fillStyle = '#CCC';
                    ctx.fillRect(j * w + (j * spacing), i * h + (i * spacing), w, h);
                }
                else if (Map[i][j] == '.')
                {
                    ctx.fillStyle = '#696';
                    ctx.fillRect(j * w + (j * spacing), i * h + (i * spacing), w, h);
                }
                else if (Map[i][j] == '_')
                {
                    ctx.fillStyle = '#696';
                    ctx.fillRect(j * w + (j * spacing), i * h + (i * spacing), w, h);
                    ctx.fillStyle = '#33B5E5';
                    ctx.fillRect(j * w + (j * spacing) + offset1, i * h + (i * spacing) + offset1, w - offset2, h - offset2);

                    spawns.push([i,j]);
                }
            }
        }

        $('#map_input').append(spawns.length+"\n");
        for (var i = 0; i < spawns.length; i++)
        {
            $('#map_input').append(spawns[i][0]+","+spawns[i][1]+"\n");
        }

        for (var i = 0; i < Map.length; i++)
        {
            $('#map_input').append(Map[i]+"\n");
        }
    }

    /**
     * Scrolls through the tiles-array and sets the tile to the next component
     * @param e
     */
    function mouseClickHandler(e)
    {
        var clickedTile = FindTile(e.clientX, e.clientY);

        var str = Map[clickedTile.y];
        var c = str[clickedTile.x];

        switch(c)
        {
            case '+':
                Map[clickedTile.y] = str.replaceAt(clickedTile.x, '#');
                break;
            case '#':
                Map[clickedTile.y] = str.replaceAt(clickedTile.x, '.');
                break;
            case '.':
                Map[clickedTile.y] = str.replaceAt(clickedTile.x, '_');
                break;
            default:
                Map[clickedTile.y] = str.replaceAt(clickedTile.x, '+');
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
        var str = Map[clickedTile.y];
        if (str[clickedTile.x] !== '+')
        {
            Map[clickedTile.y] = str.replaceAt(clickedTile.x, '+');
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
                    var len = parseInt($('#map_width').val());
                    var str = new Array(len + 1).join('+');
                    Map.push(str);
                }
            }

            if (e.value < Map.length)
            {
                Map.pop();
            }
        }

        if (e.id === "map_width")
        {
            if (e.value > Map[0].length)
            {
                for (var i = 0; i < Map.length; i++)
                {
                    var str = Map[i];
                    Map[i] = str + "+";
                }
            }

            if (e.value < Map[0].length)
            {
                for (var i = 0; i < Map.length; i++)
                {
                    var str = Map[i];
                    Map[i] = str.substring(0, str.length - 1);
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
            '++++++++',
            '+_.####+',
            '+.#####+',
            '+######+',
            '+######+',
            '+#####.+',
            '+####._+',
            '++++++++'
        ];

        Draw();
    }

    canvas.ondblclick = function(e) { mouseDoubleClickHandler(e); }
    canvas.onclick = function(e) { mouseClickHandler(e); }

    Draw();
}

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
}