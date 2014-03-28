var parser = require('./parser.js');
require('./astar.js');
var Navigator = require('./navigation.js');
var randomcount = 20 
var r = 0 
function gamestate(socket)
{
    this.nodeExit = []
    this.socket = socket;
    this.name = "Determined Gir"
    this.map;
    this.weightedmap;
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


        
        this.nodeExit = this.nodeWeights(); // !!!    !!!!   !!!!    !!!!    nodeexit[y][x] OBS!
    
       
        randomcount++
        if (randomcount > 20) {
            r = Math.floor(Math.random()*data.players.length);
            randomcount = 0;
        }

        if (r > data.players.length-1) { r = data.players.length-1 }
        this.target = [this.players[r].x, this.players[r].y];
        

        for (var i = 0; i < this.players.length; i++)
        {
            this.map[this.players[i].y][this.players[i].x] = 9; //should be made dynamic
        }

         //need some fancy function to merge the map data here.
        this.weightedmap = this.mergemaps(this.nodeExit, this.map, 9, 0) //made one!
        console.log(this.weightedmap)
        
        //HOOOLY FUCK, this is it.. let's see!
        this.map = this.weightedmap


        if (this.bombs.length > 0)
        {
            this.WeightBombs();
            var yo_mama = true;
            if ( yo_mama == true && this.bombs.length > this.players.length + 1)
            {   

                //christ man, make a function :D this shit is unreadable :D
                //also! rock and players are now weighted as 9, and not 2. nice to know :D
                
                this.armageddon = true;
                console.log("ARMAGEDDON!!!");
                this.target = [this.me.x, this.me.y];

                if (this.SafeFromPlayers(this.me.x, this.me.y, 3) == false)
                {
                    this.WeightPlayers(2);

                    var t = this.SquareSearch(this.me, 2);

                    if (t.length > 0)
                    {
                        var g = new Graph(this.map);
                        var start = g.nodes[this.me.y][this.me.x];

                        var results = [];

                        //do an a* on all safespots and determine the closest one
                        for (var i = 0; i < t.length; i++)
                        {
                            var end = g.nodes[t[i].y][t[i].x];
                            var result = astar.search(g.nodes, start, end);

                            if (result.length > 0)
                            {
                                results.push({l: result.length, i: i});
                            }
                        }

                        results.sort(function(a,b){ if (a.l < b.l) return -1; if (a.l > b.l) return 1; return 0; });

                        if (results.length > 0)
                        {
                            this.target = [results[0].x, results[0].y];
                        } else {
                            this.target = [this.me.x, this.me.y];
                        }

                    } else {
                       this.target = [this.me.x, this.me.y];
                    }

                } else {
                    this.target = [this.me.x, this.me.y];
                }

            } else {
                if (this.SafeFromBombs(this.me.x, this.me.y) == false && this.armageddon == false)
                {
                    //console.log("UNSAFE");
                    this.fear = true;
                    this.map = parser.ParseMap(data.map, this.fear);

                    for (var i = 0; i < this.players.length; i++){ var p = this.players[i]; this.map[p.y][p.x] = 0; }

                    //find all safe spots within theoretical walking distance before bomb goes off
                    var t = this.SquareSearch(this.me, 10);

                   // console.log("safe spots -------------");
                   // console.log("found " + t.length);
                   // console.log("------------------------");

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

                        //sort the array, lowest l first
                        arrays.sort(function(a,b){ if (a.l < b.l) return -1; if (a.l > b.l) return 1; return 0; })

                        var samelength = [];
                        var mytarget = [];
                        var decisionindex = 0;

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
                            this.Write("SAY TACOOOS!!!111!11one\n");
                        }

                        //use the index of the smallest list to determine the move
                       
                       // console.log("choosing " + this.result);
                        this.target = [t[this.result].x, t[this.result].y];
                        this.result = 0;
                    } else {
                        this.Write("BOMB\n");
                    }
                } else {
                   //console.log("SAFE");
                   // console.log("number of bombs : " + this.bombs.length);
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

        // this actually doesn't do anything anymore. 
         /*   if (this.SafeFromBombs(this.me.x, this.me.y) == true) {
               
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
        */
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
        this.fear = false;

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
    //console.log("In SquareSearch new")

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

gamestate.prototype.nodeWeights = function(lol) 
{
    var array = []
    var numnodes 
    for (var y = 0; y < this.map.length; y++) {
        var t = []
        
        for (var x = 0; x < this.map[0].length; x++){
            
            if (this.map[y][x] == 1){
                numnodes = this.playerMoveSearch({x: x, y: y});
                t.push (numnodes.length)
            } 
            else {
               //console.log("not a 1")
                t.push(0)
            }
        }
    array.push(t)

    }
    return array;
}



gamestate.prototype.mergemaps = function(array1, array2, val1, val2)
{
    var mergedarray = []
    var merge1
    var merge2
    
    for (var y = 0; y < array2.length; y++) {
        var t = []
    
        for (var x = 0; x < array2[0].length; x++){
            merge1 = array2[y][x]
            merge2 = 4 - array1[y][x]
            
            if (merge1 == val1) {merge2 = 0}
            if (merge1 == val2) {merge2 = 0}

            var finalmerge = merge1 + merge2
            t.push (finalmerge)
        } 
        
        mergedarray.push(t)
    }
    
    return mergedarray
}




gamestate.prototype.playerMoveSearch = function(origo)
{
    var distArr = [];
    //console.log("In PlayerMoveSearch")
    //console.log(origo)
    // Prevent search from going outside map
    

    var list = {x: [], y: []};
    list.x = [0,-1,1,0]
    list.y = [-1,0,0,1]


    for (var i = 0; i < list.x.length;i++) {
        // Is this a safe spot?
        x = origo.x + list.x[i];
        y = origo.y + list.y[i];
        //console.log("checking " + x + " " + y)
    //if (this.SafeFromBombs(x, y) == true)
    //{
        
        try{ 
            if (this.map[y][x] == 1)
        {
          //  console.log ("got an exit")
            distArr.push ({x:x, y:y})
        }
        
        } catch (err) {}

    }



    return distArr;
}

gamestate.prototype.WeightBombs = function() //should be weighted by ttl now. hard! like, 10,20,50,90,0
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
                this.map[y][x] = 0;
                /*
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
                */
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

        if (x >= p.x - r && x <= p.x + r)
        {
            if (y >= p.y - r && y <= p.y + r)
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
    //console.log(input);
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
