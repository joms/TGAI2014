var parser = require('./parser.js');
require('./astar.js');
var Navigator = require('./navigation.js');
var randomcount = 20 
var r = 0 
function gamestate(socket)
{
    
    this.socket = socket;
    this.name = "Determined Gir"
    this.map;
    this.bombs = [];
    this.players = [];
    this.me = {x: 0, x: 0};
    this.target = [];
    this.fear = false;
    this.result = 0;
    this.armageddon = false;
    this.insults = ["Piggy!\n", "Waffles?\n", "AND I'M... AAAH-ahah... I dunno.\n", "I love this show!\n", "Tell me a story about giant pigs!\n", "I'm gonna sing the Doom Song now.\n", "Awww... I wanted to explode.\n",
        "Somebody needs a hug!\n", "..MONKEY!\n", "I made mashed po-ta-toes!\n", "Cazzo duro!\n",  "I miss my cupcake.\n", "Your head smells like a puppy!\n", "The pig... COMMANDS ME!\n", "Hi floor! Make me a sandwich!\n", "Aww, it likes me.\n", "TACOOOS!!!\n"];

}

/**
 * Receive data from server, and start doing stuff
 */
gamestate.prototype.Update = function(data)
{
    if (data.type == "status update") {
        this.map = parser.ParseMap(data.map, this.fear);
        this.bombs = data.bombs;
        this.players = data.players;
        this.me.x = data.x;
        this.me.y = data.y;

       
        randomcount++
        if (randomcount > 20) {
            r = Math.floor(Math.random()*data.players.length);
            randomcount = 0;
        }

        if (r > data.players.length-1) { r = data.players.length-1}
        this.target = [this.players[r].x, this.players[r].y];
        console.log("target player " + r);


        for (var i = 0; i < this.players.length; i++)
        {
            this.map[this.players[i].y][this.players[i].x] = 2;
        }


        if (this.bombs.length > 0)
        {
            this.WeightBombs();

            if (this.bombs.length > this.players.length + 1)
            {
                this.armageddon = true;
                console.log("ARMAGEDDON!!!");
                this.target = [this.me.x, this.me.y];
                /** Fixed **/
                //vi burde gjøre armageddon-mode til true frem til end round slik at den ikke hopper mellom
                //begge states hele tiden -Stian 

                // Hvis nærmere enn 3 ruter til en person, gå i motsatt retning
                if (this.SafeFromPlayers(this.me.x, this.me.y, 3) == true)
                {
                    this.WeightPlayers(2);
                    // Start squaresearch så langt unna som mulig (men ikke i et hjørne -S), dekrementer hvis ingen treff
                    // Prøv helst å finne treff i retningen fra folk

                    var t = this.SquareSearch(this.me, 3);

                    if (t.length > 0)
                    {
                        var g = new Graph(this.map);
                        var start = g.nodes[this.me.y][this.me.x];

                        var results = [];

                        //do an a* on all safespots and determine the closest one
                        for (var i = 0; i < t.length; i++)
                        {
                            var end = tgraph.nodes[t[i].y][t[i].x];
                            var result = astar.search(g.nodes, start, end);

                            if (result.length > 0)
                            {
                                results.push({l: result.length, i: i});
                            }
                        }

                        results.sort(function(a,b){ if (a.l < b.l) return -1; if (a.l > b.l) return 1; return 0; })

                    }

                    /** Prøver med å bare vekte selve spilleren som 0 **/
                    // Hvor hardt kan vi eventuelt vekte folk?
                    // Max 75% av kartet kan være 0 f.eks?

                    /** Vekter bare selve spilleren som 0, resten blir vektet høyt - vi blir dermed aldri stuck **/
                    // Her må også en algo for å se om man har blitt presset inn i et hjørne
                    // kjøres. Hvis ja må det lettes på trykket så man kommer seg unna

                } else {
                    this.target = [this.me.x, this.me.y];
                }

                /** Fixed **/
                //eventuelt sette target til seg selv om det er safe, og bare la passive do(d)ge mode gjøre jobben sin best mulig -Stian

            } else {
                if (this.SafeFromBombs(this.me.x, this.me.y) == false && this.armageddon == false)
                {
                    console.log("UNSAFE");
                    this.fear = true;
                    this.map = parser.ParseMap(data.map, this.fear);

                    for (var i = 0; i < this.players.length; i++){ var p = this.players[i]; this.map[p.y][p.x] = 0; }

                    //find all safe spots within theoretical walking distance before bomb goes off
                    var t = this.SquareSearch(this.me, 10);

                    console.log("safe spots -------------");
                    console.log("found " + t.length);
                    console.log("------------------------");

                    var arrays = [];
                    var tgraph = new Graph(this.map);
                    var start = tgraph.nodes[this.me.y][this.me.x];

                    //check if there is any safespots present
                    if (t.length>0)
                    {
                        //do an a* on all safespots and determine the closest one
                        for (var i = 0; i < t.length; i++)
                        {
                            var end = tgraph.nodes[t[i].y][t[i].x];
                            var result = astar.search(tgraph.nodes, start, end);

                            if (result.length > 0)
                            {
                                arrays.push({l: result.length, i: i});
                            }
                        }

/*                        //find lowest length
                        var p = 1000;

                        for (var i = 0; i<arrays.length; i++)
                        {

                            if (arrays[i].l < p) {
                                this.result = arrays[i].i;
                                p = arrays[i].l;
                            }

                        }*/

                        //sort the array, lowest l first
                        arrays.sort(function(a,b){ if (a.l < b.l) return -1; if (a.l > b.l) return 1; return 0; })

                        var samelength = []
                        var mytarget = []
                        var decisionindex = 0

                        //figure out if any of the indexes have the same length and then do a squaresearch and save them in samelength
                        for (var i = 0; i<arrays.length; i++)
                        {
                            if (arrays[i].l == arrays[0].l)
                            {
                                mytarget[decisionindex] = this.playerMoveSearch(t[arrays[i].i]);
                                samelength.push({l:mytarget[decisionindex].length, i:arrays[i].i});
                                decisionindex++;
                            }
                        }

                        //sort the list, highest l first
                        samelength.sort(function(a,b){ if (a.l < b.l) return -1; if (a.l > b.l) return 1; return 0; });
                        samelength.reverse();

                        try {
                            this.result = samelength[0].i;
                        } catch (err) {
                            this.Write("TACOOOS!!!111!11one\n");
                        }

                        //use the index of the smallest list to determine the move
                       
                        console.log("choosing " + this.result);
                        this.target = [t[this.result].x, t[this.result].y];
                        this.result = 0;
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

            if (this.SafeFromBombs(this.me.x, this.me.y) == true) {
               
                if (n.move(0) == "UP\n") {
                    if (this.SafeFromBombs(this.me.x, this.me.y - 1) == false) {
                        dontmove = true;
                    }
                }
                if (n.move(0) == "DOWN\n") {
                    if (this.SafeFromBombs(this.me.x, this.me.y + 1) == false) {
                        dontmove = true;
                    }
                }
                if (n.move(0) == "RIGHT\n") {
                    if (this.SafeFromBombs(this.me.x + 1, this.me.y) == false) {
                        dontmove = true;
                    }
                }
                if (n.move(0) == "LEFT\n") {
                    if (this.SafeFromBombs(this.me.x-1, this.me.y) == false) {
                        dontmove = true;
                    }
                }
            }

            if (dontmove == false) {
                this.Write(n.move(0));}
            else {
                this.Write(this.insults[Math.floor(Math.random() * this.insults.length)]);
            }
            if (n.NextTile(0) == "ROCK")
            {
                this.Write("BOMB\n");
            }
        }

    } else if (data.type == "end round") {
        this.armageddon = false;
    } else if (data.type == "dead") {
        console.log ("this bot is apparently dead");
        var deadlist = ["but.. whyy?\n", "MORRADI ER FEIT!!\n", "Next time, mr bond!\n", "dafuq?\n", "Your mom!\n", "My plan has failed!\n"];
        var i = Math.floor(Math.random()*deadlist.length);
        this.Write("SAY " + deadlist[i] + "\n");
        this.fear = false;
    }
}

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
            if (this.SafeFromBombs(x, y) == true)
            {
                if (this.map[y][x] == 1)
                {

                    distArr.push ({x:x, y:y})
                }
            }
        }
    }

    return distArr;
}

gamestate.prototype.playerMoveSearch = function(origo)
{
    var distArr = [];
    console.log("In PlayerMoveSearch")

    // Prevent search from going outside map
    var start = {x: origo.x - 1, y: origo.y - 1};
    var stop = {x: origo.x + 1, y: origo.y + 1};
    if (start.x < 0) {start.x = 0;}
    if (start.y < 0) {start.y = 0;}
    if (stop.x > this.map[0].length - 1) {stop.x = this.map[0].length - 1;}
    if (stop.y > this.map.length - 1) {stop.y = this.map.length - 1;}

    var list = []
    list.x = [0,-1,0,1,0]
    list.y = [-1,0,0,0,1]


    for (var i = 0; i < 4;i++)
        // Is this a safe spot?
        x = origo.x + list.x[i];
    y = origo.y + list.y[i];

    if (this.SafeFromBombs(x, y) == true)
    {
        if (this.map[y][x] == 1)
        {

            distArr.push ({x:x, y:y})
        }
    }



    return distArr;
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

gamestate.prototype.WeightPlayers = function(r)
{
    for (var i = 0; i < this.players.length; i++)
    {
        var p = this.players[i];
        this.map[p.y][p.x] = 0;

        var start = {x: p.x - r, y: p.y - r};
        var stop = {x: p.x + r, y: p.y + r};
        if (start.x < 0) {start.x = 0;}
        if (start.y < 0) {start.y = 0;}
        if (stop.x > this.map[0].length - 1) {stop.x = this.map[0].length - 1;}
        if (stop.y > this.map.length - 1) {stop.y = this.map.length - 1;}

        for (var x = start.x; x <= stop.x; x++)
        {
            for (var y = start.y ; y <= stop.y; y++)
            {
                if (x == p.x && y == p.y)
                {
                    this.map[y][x] = 0;
                }
                else if ((x == p.x + 1 || x == p.x - 1) && (y == p.y + 1 || y == p.y - 1))
                {
                    this.map[y][x] = 10;
                }
                else if ((x == p.x + 2 || x == p.x - 2) && (y == p.y + 2 || y == p.y - 2))
                {
                    this.map[y][x] = 5;
                }
            }
        }

    }
}


/**
 * Check if a coordinate can be hit by a bomb
 */
gamestate.prototype.SafeFromBombs = function(x,y)
{
//    console.log("in SafeFromBombs")

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

gamestate.prototype.SafeFromPlayers = function(x,y,r)
{
    var safe = true;
    for (var i = 0; i < this.players.length; i++)
    {
        var p = this.players[i];

        if (x <= p.x - r && x >= p.x + r)
        {
            if (y <= p.y - r && y >= p.y + r)
            {
                safe = false;
            }
        }
    }
    return safe;
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
