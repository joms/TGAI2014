var net = require('net');
var GameStateHandler = require('./gamestate.js');
var iter = 0 
var HOST = '127.0.0.1';
var PORT = 54321;
var client = new net.Socket();

/*------------------------------------------
var dummydata = {
    type: "status update",
    players: [
        { id: 1, x: 6, y: 6 }
    ],
    bombs: [
    ],
    x: 1,
    y: 1,
    height: 8,
    width: 8,
    map: [
        "++++++++",
        "+..####+",
        "+.#####+",
        "+######+",
        "+######+",
        "+#####.+",
        "+####..+",
        "++++++++"
    ]
};
------------------------------------------*/

var GameState = new GameStateHandler(client);

function Connect()
{
    client.connect(PORT, HOST, function() {
        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
        client.write('JSON\n');
        client.write('NAME GIR\n');
    });
}
Connect();

client.on('error', function(data) {
    console.log('ERROR: ' + data);
    client.destroy();
});

client.on('data', function(data) {
    iter++;
    for (var i = 0; i < 15; i++){
        console.log(" ")
        
    }
    console.log("--------Iteration : " + iter + "------")
    var d = data.toString("utf-8").split("\n");
    d.pop();
    for (var i = 0; i < d.length; i++)
    {
        GameState.Update(JSON.parse(d[i]));
    }

    //console.log(GameState.players);
	//randommove()
});

client.on('close', function(error) {
    if (error == true)
    {
        console.log("Unexpected disconnection");
    } else {
        client.destroy();
        console.log("Disconnected. Trying reconnect in 1 second");

        client.destroy();
        setTimeout(function()
        {
            Connect();
        } , 1000);
    }
});

function randommove() {
	var ran = Math.floor((Math.random()*5));
	var move = ["UP","DOWN","LEFT","RIGHT","BOMB"];
	client.write(move[ran]);
}