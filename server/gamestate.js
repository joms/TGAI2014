var parser = require('./parser.js');
require('./astar.js');
var Navigator = require('./navigation.js');

function gamestate(socket)
{
    this.socket = socket;

    this.alive = true;
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
        this.alive = false;
    }
}

/**
 * Plans a new path ahead, and adds it to the commandlist
 */
gamestate.prototype.PlanPath = function()
{
    // Pathplanning
    var graph = new Graph(this.map);
    var start = graph.nodes[this.me.y][this.me.x];
    var end  = graph.nodes[this.players[0].y][this.players[0].x]; // Static path in an open map
    var result = astar.search(graph.nodes, start, end);

    // Find what the next step is called
    var n = new Navigator(result, this.map);
    if (n.path.length > 0)
    {
        this.socket.write(n.move(0));
        console.log(n.move(0));
    }
    /*
    for (var i = 1; i < result.length; i++)
    {
        this.commands.push(n.move(i));
    }
    */
}

module.exports = gamestate;