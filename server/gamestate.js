var parser = require('./parser.js');
require('./astar.js');
var Navigator = require('./navigation.js');

function gamestate(socket)
{
    this.socket = socket;

    this.map;
    this.bombs = [];
    this.players = [];
    this.me = {x: 0, x: 0};
    this.target = [];
    this.fear = false;
    this.result = 0
    this.insults = ["Piggy!", "Waffles?", "AND I'M... AAAH-ahah... I dunno.", "I love this show!", "Tell me a story about giant pigs!", "I'm gonna sing the Doom Song now.", "Awww... I wanted to explode.",
        "Somebody needs a hug!", "..MONKEY!", "I made mashed po-ta-toes!", "I miss my cupcake.", "Your head smells like a puppy!", "The pig... COMMANDS ME!", "Hi floor! Make me a sandwich!", "Aww, it likes me.", "TACOOOS!!!"];

}

/**
 * Receive data from server, and start doing stuff
 */

gamestate.prototype.SquareSearch = function(origo, r)
{
    var distArr = [];
    console.log("In SquareSearch new")

    // Prevent search from going outside map
    var start = {x: origo.x - r, y: origo.y - r};
    var stop = {x: origo.x + r, y: origo.y + r};
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
                if (this.map[y][x] == 1)
                {

                    distArr.push ({x:x, y:y})
                }
            }
        }
    }

    console.log(distArr);

    return distArr;
}

gamestate.prototype.Update = function(data)
{
    if (data.type == "status update") {
        this.map = parser.ParseMap(data.map, this.fear);
        this.bombs = data.bombs;
        this.players = data.players;
        this.me.x = data.x;
        this.me.y = data.y;

        var r = Math.floor(Math.random()*data.players.length);
        this.target = [this.players[r].x, this.players[r].y];
        console.log("target player " + r);


        console.log(this.fear);
        console.log(this.bombs);

        for (var i = 0; i < this.players.length; i++)
        {
            this.map[this.players[i].y][this.players[i].x] = 2;
        }


        if (this.bombs.length > 0)
        {
            this.WeightBombs();
            if (this.SafeSpot(this.me.x, this.me.y) == false)
            {
                console.log("UNSAFE");
                this.fear = true;
                this.map = parser.ParseMap(data.map, this.fear);

                for (var i = 0; i < this.players.length; i++){ var p = this.players[i]; this.map[p.y][p.x] = 0; }

                var rad = 5;
                var t = [];

                // while (t.length < 1)
                // {
                //     t = this.SquareSearch(this.me, rad);
                //     rad++;
                // }

                //find all safe spots within theoretical walking distance before bomb goes off
                t = this.SquareSearch(this.me,rad);

                console.log("safe spots -------------")
                console.log("found " + t.length)
                console.log("------------------------")

                var arrays = []
                var lastresult = []
                var tgraph = new Graph(this.map);
                var start = tgraph.nodes[this.me.y][this.me.x];

                //check if there is any safespots present
                if (t.length>0) {
                    //do an a* on all safespots and determine the closest one
                    for (var i = 0; i < t.length; i++){
                        var end = tgraph.nodes[t[i].y][t[i].x]
                        var result = astar.search(tgraph.nodes, start, end);

                        if (result.length > 0) {
                            arrays.push({l: result.length, i: i})
                        }

                        var p = 1000}
                    for (var i = 0; i<arrays.length; i++) {

                        if (arrays[i].l < p) {
                            this.result = arrays[i].i
                            p = arrays[i].l
                        }

                    }

                    // arrays.sort(function(a, b) {return a[1] - b[1]});
                    //use the index of the smallest list to determine the move
                    console.log(arrays)
                    console.log("choosing " + this.result)
                    var arrays = []
                    var lastresult = []
                    var result = []
                    this.target = [t[this.result].x, t[this.result].y];
                    this.result = 0
                }
                else {
                    this.Write("BOMB\n");
                }
            }

            else {
                console.log("SAFE");
                console.log(this.me);
                console.log(this.bombs);
                console.log(data.bombs);
                this.fear = false;
            }
        }

        // Define a new a* graph
        var graph = new Graph(this.map);
        var start = graph.nodes[this.me.y][this.me.x];
        console.log("setting target -------------")
        console.log(this.target)
        console.log("----------------------------")
        var end  = graph.nodes[this.target[1]][this.target[0]];
        var result = astar.search(graph.nodes, start, end);

        // Find what the next step is called
        var n = new Navigator(result, this.map);

        if (n.path.length != 0)
        {
            var dontmove = false;

            if (this.SafeSpot(this.me.x, this.me.y) == true) {
                console.log ("-----");
                console.log (n.move(0));
                console.log ("-----");

                if (n.move(0) == "UP\n") {
                    if (this.SafeSpot(this.me.x, this.me.y - 1) == false) {
                        dontmove = true;
                    }
                    console.log(result[1]);
                }
                if (n.move(0) == "DOWN\n") {
                    if (this.SafeSpot(this.me.x, this.me.y + 1) == false) {
                        dontmove = true;
                    }
                }
                if (n.move(0) == "RIGHT\n") {
                    if (this.SafeSpot(this.me.x + 1, this.me.y) == false) {
                        dontmove = true;
                    }
                }
                if (n.move(0) == "LEFT\n") {
                    if (this.SafeSpot(this.me.x-1, this.me.y) == false) {
                        dontmove = true;
                    }
                }
            }

            if (dontmove == false) {
                this.Write(n.move(0));}
            else {
                console.log("not moving");
            }
            if (n.NextTile(0) == "ROCK")
            {
                this.Write("BOMB\n");
            }
        }

    } else if (data.type == "end round") {

    } else if (data.type == "dead") {
        console.log ("this bot is apparently dead");
        var deadlist = ["but.. whyy?", "MORRADI ER FEIT!!", "Next time, mr bond!", "dafuq?", "Your mom!", "My plan has failed!"];
        var i = Math.floor(Math.random()*deadlist.length);
        this.Write("SAY " + deadlist[i] + "\n");
        this.fear = false;
    }
}

gamestate.prototype.WeightBombs = function()
{
    for (var i = 0; i < this.bombs.length; i++)
    {
        var b = this.bombs[i];
        this.map[b.y][b.x] = 0;


        var start = {x: b.x - 2, y: b.y - 2};
        var stop = {x: b.x + 2, y: b.y + 2};
        if (start.x < 0) {start.x = 0;}
        if (start.y < 0) {start.y = 0;}
        if (stop.x > this.map[0].length - 1) {stop.x = this.map[0].length - 1;}
        if (stop.y > this.map.length - 1) {stop.y = this.map.length - 1;}

        for (var x = start.x; x <= stop.x; x++)
        {
            this.map[b.y][x] = 0;
        }
        for (var y = start.y ; y <= stop.y; y++)
        {
            this.map[y][b.x] = 0;
        }

    }
}


/**
 * Check if a coordinate can be hit by a bomb
 */
gamestate.prototype.SafeSpot = function(x,y)
{
//    console.log("in SafeSpot")

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
    return safe;
}

gamestate.prototype.checkForEnemiesInRadius = function()
{
//    console.log("in SafeSpot")

    var boom = false;
    for (var i = 0; i < this.players.length; i++)
    {
        var x = this.players[i].x
        var y = this.players[i].y


        var b = this.me;

        if (x == b.x && b.y -2 <= y && b.y +2 >= y)
        {
            boom = true;
        }

        if (y == b.y && b.x -2 <= x && b.x +2 >= x)
        {
            boom = true;
        }
    }
    return boom;
}

gamestate.prototype.CanGetThere = function(x, y, target, bombs)
{
    var m = this.map;

    if (bombs == true)
    {
        for (var i = 0; i < this.bombs.length; i++)
        {
            var b = this.bombs[i];

            m[b.y][b.x] = 0;
        }
    }

    var g = new Graph(m);
    var start = g.nodes[from[1]][from[0]];
    var end = g.nodes[to[1]][to[0]];

    var r = astar.search(g.nodes, start, end);

    if (r.length == 0)
    {
        return false;
    } else {
        return true;
    }
}

/**
 * Send input to server
 */
gamestate.prototype.Write = function(input)
{
    this.socket.write(input);
    console.log(input);
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
