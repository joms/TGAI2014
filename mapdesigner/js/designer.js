/**
 * 0 = ~
 * 1 = boat
 * 2 = splash
 * 3 = BHAM
 */

function MapDesigner(canvas)
{
    var canvas = canvas;
    var ctx = canvas.getContext('2d');

    var Map =  [[0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0]];

    var ships = {2: [], 3: [], 4: [], 5: []};
    var shipTypes = {2: 4, 3: 3, 4: 2, 5: 1};

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
                    ctx.fillStyle = '#666';
                    ctx.fillRect(j * w + (j * spacing), i * h + (i * spacing), w, h);
                    ctx.fillStyle = '#33B5E5';
                    ctx.fillRect(j * w + (j * spacing) + offset1, i * h + (i * spacing) + offset1, w - offset2, h - offset2);
                }
                else if (Map[i][j] == 3)
                {
                    ctx.fillStyle = '#CCC';
                    ctx.fillRect(j * w + (j * spacing), i * h + (i * spacing), w, h);
                    ctx.fillStyle = '#FF4444';
                    ctx.fillRect(j * w + (j * spacing) + offset1, i * h + (i * spacing) + offset1, w - offset2, h - offset2);
                }
            }
        }
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
     * Removes ship at given coordinate when user doubleclicks
     * @param e
     */
    function mouseDoubleClickHandler(e)
    {
        var clickedTile = FindTile(e.clientX, e.clientY);
        if (Map[clickedTile.y][clickedTile.x] === 1)
        {
            for (var i = 2; i <= 5; i++)
            {
                for (var j = 0; j < ships[i].length; j++){
                    for (var k = 0; k < ships[i][j].length; k++)
                    {
                        if (ships[i][j][k][0] === clickedTile.x && ships[i][j][k][1] === clickedTile.y)
                        {
                            CircleTiles(ships[i][j], true);
                            ships[i].splice(j, 1);
                            Draw();
                            return;
                        }
                    }
                }
            }
        }
    }

    /**
     * Checks if ship given in array intersects with another ship, if not it's added to map
     * @param input Ship in form of an array
     * @param del Boolean representing whether it's a delete or not
     * @returns {boolean}
     */
    function CircleTiles(input, del)
    {
        // Check if ship intersects another ship
        if (del == false)
        {
            for (var i = 0; i < input.length; i++)
            {
                var x = input[i];
                if (Map[x[1]][x[0]] == 1)
                    return;
            }
        }

        // Add ship to map
        for (var i = 0; i < input.length; i++)
        {
            var x = input[i]
            var type = (Map[x[1]][x[0]] + 1) % 2;
            Map[x[1]][x[0]] = type;
        }

        return true;
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

    function ClearMap()
    {
        Map = [[0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0]];
        ships = {2: [], 3: [], 4: [], 5: []};
        Draw();
    }

    /**
     * Checks if all is good before sending the map away to server
     * This should be checked on the serverside too
     */
    this.Submit = function()
    {
        /**
         * Commented for debugging
         for (var i = 2; i <= 5; i++)
         {
             if (ships[i] > shipTypes[i])
             {
                 terminal.log(Parser.Parse({type: "ERROR", result: "Too many ships (cheater!)"}));
                 return false;
             } else if (ships[i] < shipTypes[i]) {
                 terminal.log(Parser.Parse({type: "ERROR", result: "Too few ships"}));
                 return false;
             }
         }
         */

        socket.emit('submit_map', Map);
    }

    canvas.onmousedown = function(e) { mouseDownHandler(e); }
    canvas.onmouseup = function(e) { mouseUpHandler(e); }
    canvas.onmousemove = function(e) { mouseMoveHandler(e); }
    canvas.ondblclick = function(e) { mouseDoubleClickHandler(e); }

    Draw();
}