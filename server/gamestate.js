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

    this.commands = [];

    this.map = [];
    this.bombs = [];
    this.players = [];
}

gamestate.prototype.Update = function(data)
{
    if (data.type == "status update") {
        this.map = parser.ParseMap(data.map);
        this.bombs = data.bombs;
        this.players = data.players;
        this.me.x = data.x;
        this.me.y = data.y;

        if (this.bombs.length > 0)
        {
            this.PlanBombs();
        }

        if (this.commands.length == 0)
        {
            this.PlanPath();
        }
        if (this.commands.length > 0)
        {
            this.socket.write(this.commands[0]);
            this.commands.shift();
        }

        //this.state = "waiting";
    } else if (data.type == "end round") {

    } else if (data.type == "dead") {
        this.socket.write("SAY PERKELE\n");
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

    if (this.me.x == this.target[0] == this.me.y == this.target[1]) this.target = [];

    if (this.target.length > 0)
    {
        var end = graph.nodes[this.target[1]][this.target[0]];
    } else {
        var end  = graph.nodes[this.players[r].y][this.players[r].x]; // Static path in an open map
    }
    var result = astar.search(graph.nodes, start, end);

    // Find what the next step is called
    var n = new Navigator(result, this.map);
    if (n.path.length != 0)
    {
        this.socket.write(n.move(0));
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
        console.log(b);
        console.log(this.me.x+","+this.me.y);
        if (b.y - 2 < this.me.y && b.y + 2 > this.me.y)
        {
            if (b.x - 2 < this.me.x && b.x + 2 > this.me.x)
            {
                this.target = [this.me.x, this.me.y+1];
            }
        }
    }
}

/*gamestate.prototype.SquareSearch = function(r)
{
    var scan = {x: this.me.x - r};

        for scan.x = you.x - radius, you.x + radius {
            for scan.y = you.y - radius, you.y + radius {
                d = getdistance (you, scan)
                if not distancearray[scan.x][scan.y] then
                {distancearray[x][y] = d}
            }
        }
}*/

module.exports = gamestate;