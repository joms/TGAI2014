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

    var tiles = [0, 1, 2, 'X'];

    var clickStart = {mouse: [0,0], tile: [0,0]};
    var mouseIsDown = false;

    function Draw()
    {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var tiles = Map.length;
        var spacing = 2;

        var w = canvas.width / tiles - spacing;
        var h = canvas.height / tiles - spacing;

        var offset1 = w / 4;
        var offset2 = (h / 4) * 2;

        // Handling colors and shapes according to whatever number's returned from map
        for (var i = 0; i < tiles; i++){
            for (var  j= 0; j < tiles; j++){
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

    function mouseDownHandler(e)
    {
        e.preventDefault();
        mouseIsDown = true;
        var x = e.clientX;
        var y = e.clientY;

        var tile = FindTile(x, y);

        clickStart.mouse[0] = x;
        clickStart.mouse[1] = y;
        clickStart.tile[0] = tile.x;
        clickStart.tile[1] = tile.y;
    }

    function mouseUpHandler(e)
    {
        mouseIsDown = false;
        var x = e.clientX;
        var y = e.clientY;

        var tile = FindTile(x, y);

        var movedSquaresX = Math.abs(tile.x - clickStart.tile[0]);
        var movedSquaresY = Math.abs(tile.y - clickStart.tile[1]);

        // There's no ship that huge - nor that small
        if (movedSquaresX > 4 || movedSquaresY > 4 || (movedSquaresY == 0 && movedSquaresX == 0)) return;

        //find what ship were drawn, and save it to an array
        var drawnShip = [];
        if (movedSquaresX > movedSquaresY)
        {
            if (clickStart.tile[0] < tile.x)
            {
                for (var i = clickStart.tile[0]; i <= tile.x; i++)
                {
                    drawnShip.push([i, tile.y]);
                }
            } else {
                for (var i = clickStart.tile[0]; i >= tile.x; i--)
                {
                    drawnShip.push([i, tile.y]);
                }
            }
        } else {
            if (clickStart.tile[1] < tile.y)
            {
                for (var i = clickStart.tile[1]; i <= tile.y; i++)
                {
                    drawnShip.push([tile.x, i]);
                }
            } else {
                for (var i = clickStart.tile[1]; i >= tile.y; i--)
                {
                    drawnShip.push([tile.x, i]);
                }
            }
        }

        // Check whether the ship have been used too many times or it intersects another ship
        if (ships[drawnShip.length].length < shipTypes[drawnShip.length])
        {
            if (!CircleTiles(drawnShip, false)) return;
            ships[drawnShip.length].push(drawnShip);
        }

        Draw();
    }

    /**
     * Animating the mousemove when adding ships
     */
    function mouseMoveHandler(e)
    {
        if (!mouseIsDown) return;

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
     * Removes resets tile to wall
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

        var squareX = Math.floor(x / canvas.width * Map.length);
        var squareY = Math.floor(y / canvas.height * Map[0].length);
        return {x: squareX, y: squareY};
    }

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

    canvas.onmousedown = function(e) { mouseDownHandler(e); }
    canvas.onmouseup = function(e) { mouseUpHandler(e); }
    canvas.onmousemove = function(e) { mouseMoveHandler(e); }
    canvas.ondblclick = function(e) { mouseDoubleClickHandler(e); }
    canvas.onclick = function(e) { mouseClickHandler(e); }

    Draw();
}