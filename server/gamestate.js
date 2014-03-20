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
    this.blacklist = [];
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

        //this.state = "waiting";
    } else if (data.type == "end round") {

    } else if (data.type == "dead") {
        this.Write("SAY PERKELE\n");
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
        var end  = graph.nodes[this.players[r].y][this.players[r].x];
    }
    var result = astar.search(graph.nodes, start, end);

    // Find what the next step is called
    var n = new Navigator(result, this.map);
    if (n.path.length != 0)
    {
        if (n.NextTile(0) == "ROCK")
        {
            this.Write(n.move(0));
            this.Write("BOMB\n");
            this.flee = true;
        } else {
            this.Write(n.move(0));
        }
    }
}

/**
 * Add bomb-locations to the map, and weight accordingly
 */
gamestate.prototype.PlanBombs = function()
{
    // Can it hit me?
    for (var i = 0; i < this.bombs.length; i++)
    {
        var b = this.bombs[i];
        if (b.y - 2 < this.me.y && b.y + 2 > this.me.y)
        {
            if (b.x - 2 < this.me.x && b.x + 2 > this.me.x)
            {
                var t = this.SquareSearch(1);
                this.target = [t.x, t.y];
                //console.log(this.target);
                this.flee = true;
            }
        }
    }
    this.SquareSearch(1);
}

gamestate.prototype.SquareSearch = function(r)
{
    var distArr = [];
    //for (var i = 0; i < this.map.length; i++)
    //    distArr.push([]);

    console.log(this.me);
    console.log(this.target);

    for (var x = this.me.x - r; x < this.me.x + r; x++)
    {
        for (var y = this.me.y - r; y < this.me.y + r; y++)
        {
            //console.log(x +", "+y);
            var d = lineDistance({x: this.me.x, y: this.me.y}, {x: x, y: y})

            var index = -1;
            if (this.blacklist.length > 0)
            {
                for(var i = 0; i < this.blacklist.length; i++) {
                    if (this.blacklist[i].x === x && this.blacklist[i].y === y) {
                        index = i;
                    }
                }
            }

            if (this.map[y][x] == 1 && index == -1)
            {
                distArr.push({x: x, y: y, d: d});
            }
        }
    }

    distArr.sort(function(a, b) {return a[2] - b[2]});
    this.blacklist.push(distArr[0]);
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