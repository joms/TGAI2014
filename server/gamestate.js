var parser = require('./parser.js');
require('./astar.js');
var Navigator = require('./navigation.js');

function gamestate(socket)
{
    this.socket = socket;

    this.powerups = [];
    this.state = "ready";
    this.target = [];
    this.me = {};
    this.flee = false;
    this.scarybombs = [];

    this.commands = [];
    this.lastcommand = "";

    this.map = [];
    this.bombs = [];
    this.players = [];
}

gamestate.prototype.Update = function(data)
{
    if (data.type == "status update") {
        this.map = parser.ParseMap(data.map, this.flee);
        this.bombs = data.bombs;
        this.players = data.players;
        this.me.x = data.x;
        this.me.y = data.y;

        if (this.bombs.length > 0)
        {
            this.PlanBombs();
        } else {
            this.flee = false;
        }

        if (this.commands.length == 0)
        {
            this.PlanPath();
        }
        if (this.commands.length > 0)
        {
            this.Write(this.commands[0]);
            this.commands.shift();
        }
    } else if (data.type == "end round") {

    } else if (data.type == "dead") {
        var deadlist = ["but.. whyy?", "MORRADI ER FEIT!!", "Next time, mr bond!", "dafuq?", "Your mom!", "My plan has failed!"]
        var i = Math.floor(Math.random()*deadlist.length)
        this.Write(deadlist[i]);
    }
}

/**
 * Plans a new path ahead, and adds it to the commandlist
 */
gamestate.prototype.PlanPath = function()
{
    // Define a new a* graph
    var graph = new Graph(this.map);
    // Set the start location to me
    var start = graph.nodes[this.me.y][this.me.x];

    /**
     * This whole piece need to be changed!
     */
    if (this.me.x == this.target[0] && this.me.y == this.target[1])
    {
        this.target = [];
    }

    if (this.target.length > 0)
    {
        var end = graph.nodes[this.target[1]][this.target[0]];
    } else {
        var end  = graph.nodes[this.players[0].y][this.players[0].x];
    }
    var result = astar.search(graph.nodes, start, end);

    // Find what the next step is called
    var n = new Navigator(result, this.map);
    var dontmove = false
            
    if (n.path.length != 0)
    {
        if (n.NextTile(0) == "ROCK")
        {
            this.Write(n.move(0));
            this.Write("BOMB\n");
        } 

        else {
            
            console.log ("-----------------------")
            console.log (this.SafeSpot(this.me.x, this.me.y))
            console.log (this.bombs.length) 
            console.log ("-----------------------")
           
            if (this.SafeSpot(this.me.x, this.me.y) == true) {
                if (this.bombs.length >= 1) {
                    this.target = [];
                    console.log ("not moving")
                    var dontmove = true
                }
            }
            
            
            if (dontmove == false) {
                console.log ("Moving to" + this.target)
                this.Write(n.move(0));
            }
        }
    }
}

/**
 * Add bomb-locations to the map, and weight accordingly
 */
gamestate.prototype.PlanBombs = function()
{
    // Can it hit me?
    if (this.SafeSpot(this.me.x, this.me.y) == false)
    {
        for (var i = 0; i < this.scarybombs.length; i++)
        {
            for (var j = 0; j < this.bombs.length; j++)
            {
                // Is this bomb a scary bomb?
                if (i.x == j.x && i.y == j.y)
                {
                    // Search for safe spots
                    var t = this.SquareSearch(2);
                    //console.log(t);
                    this.target = [t.x, t.y];
                    console.log("target");
                    console.log(this.target);
                    this.flee = true;
                }
            }
        }
    } else {
        this.flee = false;
    }

}

gamestate.prototype.SquareSearch = function(r)
{
    var distArr = [];

    var start = {x: this.me.x - r, y: this.me.y - r}
    var stop = {x: this.me.x + r, y: this.me.y + r}
    if (start.x < 0) {start.x = 0;}
    if (start.y < 0) {start.y = 0;}
    if (stop.x > this.map[0].length - 1) {stop.x = this.map[0].length - 1;}
    if (stop.y > this.map.length - 1) {stop.y = this.map.length - 1;}

    for (var x = start.x; x <= stop.x; x++)
    {
        for (var y = start.y ; y <= stop.y; y++)
        {

            // Is this a safe spot?
            if (this.SafeSpot(x, y) == true)
            {  
                try{

                    // Is this a walkable spot?
                    if (this.map[y][x] == 1)
                    {
                        var d = lineDistance({x: this.me.x, y: this.me.y}, {x: x, y: y})

                        // Is this where I'm standing? If so, we're safe - for now
                        if (x == this.me.x && y == this.me.y)
                        {
                            return {x: x, y: y, d: d};
                        }

                        distArr.push({x: x, y: y, d: d});
                    }
                } catch (err) {
                    // This shouldn't happen anymore - was because of the search going outside the map
                    console.log(err);
                    console.log("x: "+x+", y: "+y);
                    console.log(this.map);
                }
            }
            else {
                 console.log(x +", "+y+" NOT SAFE");
            }
        }
    }

    // Sort the distance array based on it's length
    distArr.sort(function(a, b) {return a[2] - b[2]});
    console.log(distArr[0])
    console.log(this.me)
    // Return the closest point
    return distArr[0];

}

/**
 * Send input to server
 */
gamestate.prototype.Write = function(input)
{
    var log = [
        "RIGHT\n",
        "LEFT\n",
        "DOWN\n",
        "UP\n"
    ];
    this.socket.write(input);
    if (log.indexOf(input) > -1) this.lastcommand = input;
}

/**
 * Check if a coordinate can be hit by a bomb
 */
gamestate.prototype.SafeSpot = function(x,y)
{
    var safe = true;
    this.scarybombs = [];
    for (var i = 0; i < this.bombs.length; i++)
    {
        var b = this.bombs[i];

        if (x == b.x && b.y -2 <= y && b.y +2 >= y)
        {
            safe = false;
            this.scarybombs.push(b);
        }

        if (y == b.y && b.x -2 <= x && b.x +2 >= x)
        {
            safe = false;
            this.scarybombs.push(b);
        }
    }
    //console.log ("safe")
    //console.log (safe)
    return safe;
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

module.exports = gamestate;