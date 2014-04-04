var parser = require('./parser.js');
require('./astar.js');
var Navigator = require('./navigation.js');
var randomcount = 20 
var r = 0 
var onetimebool = false 

function gamestate(socket)
{
    this.nodeExit = []
    this.socket = socket;
    this.name = "Determined Gir"
    this.map;
    this.weightedmap;
    this.bombs = [];
    this.players = [];
    this.me = {x: 0, y: 0};
    this.target = [];
    this.fear = false;
    this.result = 0;
    this.armageddon = false;
    this.insults = ["Piggy!\n", "Waffles?\n", "AND I'M... AAAH-ahah... I dunno.\n", "I love this show!\n", "Tell me a story about giant pigs!\n", "I'm gonna sing the Doom Song now.\n", "Awww... I wanted to explode.\n",
        "Somebody needs a hug!\n", "..MONKEY!\n", "I made mashed po-ta-toes!\n", "Cazzo duro!\n",  "I miss my cupcake.\n", "Your head smells like a puppy!\n", "The pig... COMMANDS ME!\n", "Hi floor! Make me a sandwich!\n", "Aww, it likes me.\n", "TACOOOS!!!\n"];
    this.safestspot = []
    this.oldtarget = {x:0,y:0}
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


        //gi nodene vekt basert på hvor mange utganger de har
        this.nodeExit = this.nodeWeights(); // !!!    !!!!   !!!!    !!!!    nodeexit[y][x] OBS!
    
       
        //velg en tilfeldig spiller som target hvert 20 tick
        randomcount++
        if (randomcount > 20) {
            ran = Math.floor(Math.random()*data.players.length);
            randomcount = 0;
        }

        //vei spillere inn i kartet         
        for (var i = 0; i < this.players.length; i++)
        {
            this.map[this.players[i].y][this.players[i].x] = 100; //should be made dynamic
        }

        
        //merge kartet med nodeexits
        this.weightedmap = this.mergemaps(this.nodeExit, this.map, 100, 0) //made one!

        //velg nærmeste spiller som target
        
        var arrays = [];
        var tgraph = new Graph(this.map);
        var start = tgraph.nodes[this.me.y][this.me.x];

        for (var i = 0; i < this.players.length; i++)
        {
            var end = tgraph.nodes[this.players[i].y][this.players[i].x];
            var result = astar.search(tgraph.nodes, start, end);

            if (result.length > 0)
            {
                arrays.push({l: result.length, i: i});
            }
        }
        
        arrays.sort(function(a,b){ if (a.l < b.l) return -1; if (a.l > b.l) return 1; return 0; })
        
        try {this.target = [this.players[arrays[0].i].x, this.players[arrays[0].i].y];} 
        catch (err) {this.target = [this.me.x,this.me.y];}    
        
        
        //om det bare er en motstander igjen på kartet
        if (this.players.length < 2) {
            this.target = [this.safestspot[0].x, this.safestspot[0].y];
        }
        

        //sett det mergede kartet til hovedkart
        this.map = this.weightedmap

        //er det bomber på kartet? 
        if (this.bombs.length > 0)
        {
            this.WeightBombs(0);
            var yo_mama = true;
            if (this.bombs.length > this.players.length + 1)
            {
                this.armageddon = true;
                console.log("ARMAGEDDON!!!");
            }

            //står jeg på et sikkert sted? 
            if (this.SafeFromBombs(this.me.x, this.me.y) == false)
            {
                //sett fear til true (dette vil gjøre stein til vegg)
                this.fear = true;
                this.map = parser.ParseMap(data.map, this.fear);
                //vei om kartet
               
                this.weightedmap = this.mergemaps(this.nodeExit, this.map, 100, 0) //made one!
                this.map = this.weightedmap
                //vei inn bomber, og sprengradius. bomber = 0, sprengradius == 999
                this.WeightBombs(0)
                //vei inn andre spillere som stein
                for (var i = 0; i < this.players.length; i++){ var p = this.players[i]; this.map[p.y][p.x] = 0; }

                //find all safe spots within theoretical walking distance before bomb goes off
                var t = this.SquareSearch(this.me, 8);
                console.log(this.map)
                console.log(t)

                //sjekk hvilke av safespotene som ligger nærmest/innenfor hvor man kan gå
                if (t.length>0) {
                    var result = []
                    var safecheck = []
                    var graph = new Graph(this.map);
                    var start = graph.nodes[this.me.y][this.me.x];
                    
                    for (var i = 0;i<t.length;i++) {
                        var end  = graph.nodes[t[i].y][t[i].x];
                        result = astar.search(graph.nodes, start, end);
                        var r = result.length 
                        if (r>0) {
                            safecheck.push({i: i, r: r, s: this.map[t[i].y][t[i].x]})
                        }
                    }
                    
                
                    safecheck.sort(function(a,b){ if (a.r< b.r) return -1; if (a.r > b.r) return 1; return 0; })
                    
                    console.log("safecheck")
                    console.log(safecheck)

                    //om to har samme lengde, velg den sikreste
                    var samelength = []
                    for (var i=0; i < safecheck.length; i++) {
                        if (safecheck[i].r <= 5){
                            samelength.push(safecheck[i])
                        }
                    }

                    samelength.sort(function(a,b){ if (a.s< b.s) return -1; if (a.s > b.s) return 1; return 0; })
                    console.log("samelength")
                    console.log(samelength)

                    if (samelength.length > 0){
                    index = samelength[0].i
                    this.target = [t[index].x, t[index].y];
                    }
                    else
                        {console.log("no way out")
                        this.target = [this.me.x, this.me.y]}
                }
                    

                //console.log("locked")
                //while (this.fear == true) {}

                
            } else {

                this.map = this.weightedmap
                this.WeightBombs(1)
                this.fear = false;
            }
        }
        
        console.log(this.map)        

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
            this.oldtarget.x = this.target[0]
            this.oldtarget.y = this.target[1]

            console.log(this.map)
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
        this.armageddon = false;
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
                if (this.map[y][x] >= 1 && this.map[y][x] <= 99)
                {

                    var safeindex = this.map[y][x]
                    distArr.push ({x:x, y:y, s:safeindex})
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

    var array2 = []
    var weighnodes 
    for (var y = 0; y < this.map.length; y++) {
        var t = []
        
        for (var x = 0; x < this.map[0].length; x++){
            
            if (this.map[y][x] == 0){t.push(0)
            }
            else{
                weighnodes = this.modifyweight(x,y,array);
                t.push (weighnodes)
            } 
            
        }
    
    array2.push(t)
    }
    
    return array2;
}

gamestate.prototype.modifyweight = function(x,y,array)
{
    var mod = 0
    var list = {x: [], y: []};
    list.x = [0,-1,1,0]
    list.y = [-1,0,0,1]

    for (var i = 0; i < list.x.length; i++)
    {
        sx = x+list.x[i]
        sy = y+list.y[i]
    
        if (array[sy][sx] < 5) {
            if (array[y][x] > array[sy][sx]) {
                mod = mod - .1
            } 
            if (array[y][x] <= array[sy][sx]) {
                mod = mod + .1
            } 
        }    
    
    }
    
    returnval = Math.round((array[y][x] + mod)*10);
    if (array[y][x] = 0) {returnval = 0}
    return returnval; 
}

gamestate.prototype.mergemaps = function(array1, array2, val1, val2)
{
    var safest = []
    var mergedarray = []
    var merge1
    var merge2
    var lastmerge
    var sorted = []
    var finalmerge
   
   for (var y = 0; y < array2.length; y++) {
        var t = []
    
        for (var x = 0; x < array2[0].length; x++){
            merge1 = array2[y][x]
            merge2 = 50 - array1[y][x]
            if (merge2>1){merge2 = merge2*2}
            
            if (merge1>500) {merge2 = 0}
            if (merge1 == val1) {merge2 = 0}
            if (merge1 == val2) {merge2 = 0}

            finalmerge = merge1 + merge2
            
            
                if (finalmerge == 0 || finalmerge > 99) {

                }else{
                    sorted.push({x: x, y: y, v: finalmerge})
                }
            
            lastmerge = finalmerge
            t.push (finalmerge)
        } 
        
        mergedarray.push(t)
    }
    
    sorted.sort(function(a,b){ if (a.v < b.v) return -1; if (a.v > b.v) return 1; return 0; })
    
    
    
    for (var i = 0; i < sorted.length; i++) {
        if (sorted[i].v == sorted[0].v) {
            safest.push({x: sorted[i].x, y: sorted[i].y});
        }
    }
   
    console.log("safest")
    console.log(safest)
    this.safestspot = safest
    
    
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
            if (this.map[y][x] >= 1 && this.map[y][x] <= 50)
        {
          //  console.log ("got an exit")
            distArr.push ({x:x, y:y})
        }
        
        } catch (err) {}

    }



    return distArr;
}

gamestate.prototype.WeightBombs = function(f) //should be weighted by ttl now. hard! like, 10,20,50,90,0
{
    for (var i = 0; i < this.bombs.length; i++)
    {
        var b = this.bombs[i];
        

        
            var start = {x: b.x - 2, y: b.y - 2};
            var stop = {x: b.x + 2, y: b.y + 2};
            if (start.x < 0) {start.x = 0;}
            if (start.y < 0) {start.y = 0;}
            if (stop.x > this.map[0].length - 1) {stop.x = this.map[0].length - 1;}
            if (stop.y > this.map.length - 1) {stop.y = this.map.length - 1;}

            if (f == 0) { 
                for (var x = start.x; x <= stop.x; x++)
                {
                    if (this.map[b.y][x] != 0) { 
                        this.map[b.y][x] = 999;
                    }        
                }
                for (var y = start.y ; y <= stop.y; y++)
                {
                    if (this.map[y][b.x] != 0) {     
                        this.map[y][b.x] = 999;
                    }
                }
            }
            else {
                for (var x = start.x; x <= stop.x; x++)
                {
                    if (this.map[b.y][x] != 0) { 
                        this.map[b.y][x] = 0;
                    }        
                }
                for (var y = start.y ; y <= stop.y; y++)
                {
                    if (this.map[y][b.x] != 0) {     
                        this.map[y][b.x] = 0;
                    }
                }


            }        
    this.map[b.y][b.x] = 0;
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
