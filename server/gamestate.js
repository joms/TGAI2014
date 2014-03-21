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

        //this.state = "waiting";
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
    // Pathplanning
    var r = Math.floor(Math.random()*this.players.length);
    var graph = new Graph(this.map);
    var start = graph.nodes[this.me.y][this.me.x];

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
        var t = this.SquareSearch(6);
        console.log(t);
        this.target = [t.x, t.y];
       // console.log("target");
       // console.log(this.target);
        this.flee = true;
    }
    else {this.flee = false;}

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
            
            var d = lineDistance({x: this.me.x, y: this.me.y}, {x: x, y: y})

            if (this.SafeSpot(x, y) == true)
            {  
                try{
                    if (this.map[y][x] == 1)
                    {
                        if (x == this.me.x && y == this.me.y)
                        {
                            return {x: x, y: y, d: d};
                        }
                        distArr.push({x: x, y: y, d: d});
                    }
                } catch (err)
                {
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

    distArr.sort(function(a, b) {return a[2] - b[2]});
    console.log(distArr[0])
    console.log(this.me)
    return distArr[0];

}

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

gamestate.prototype.SafeSpot = function(x,y)
{
    var safe = true;
    for (var i = 0; i < this.bombs.length; i++)
    {
        var b = this.bombs[i];

        if (x == b.x && b.y -2 <= y && b.y +2 >= y)
        {
            safe = false;
        }

        if (y == b.y && b.x -2 <= x && b.x +2 >= x)
        {
            safe = false;
        }
    }
    //console.log ("safe")
    //console.log (safe)
    return safe;
/*    for (var i = 0; i < this.bombs.length; i++)
    {
        var b = this.bombs[i];
        if (b.y - 2 <= y && b.y + 2 >= y)
        {
            if (b.x - 2 <= x && b.x + 2 >= x)
            {
*//*                var m = this.map;
                m[b.y-2][b.x] = 'O';
                m[b.y-1][b.x] = 'O';
                m[b.y][b.x] = 'O';
                m[b.y+1][b.x] = 'O';
                m[b.y+2][b.x] = 'O';
                m[b.y][b.x-1] = 'O';
                m[b.y][b.x-2] = 'O';
                m[b.y][b.x+1] = 'O';
                m[b.y][b.x+2] = 'O';
                m[y][x] = 'X';
                console.log(m);*//*
                return false;
            }
        }
    }
    return true;*/
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

module.exports = gamestate;