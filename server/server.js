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

/**
 * Connects to the server on given port and host
 */
function Connect()
{
    client.connect(PORT, HOST, function() {
        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
        client.write('JSON\n');
        client.write('NAME GIR\n');
    });
}
// Call connect when server.js starts
Connect();

client.on('error', function(data) {
    console.log('ERROR: ' + data);
    client.destroy();
});

client.on('data', function(data) {
    // Splits data on \n
    iter++;
    for (var i = 0; i < 15; i++){
        console.log(" ")
        
    }
    console.log("--------Iteration : " + iter + "------")
    var d = data.toString("utf-8").split("\n");
    // Removes last object in array, as it's an \n
    d.pop();
    // Send all data-string to Update()
    for (var i = 0; i < d.length; i++)
    {
        GameState.Update(JSON.parse(d[i]));
    }
});

client.on('close', function(error) {
    if (error == true)
    {
        console.log("Unexpected disconnection");
    } else {
        client.destroy();
        console.log("Disconnected. Trying reconnect in 1 second");

        client.destroy();

        // Try to reconnect once in 1 second
        setTimeout(function()
        {
            Connect();
        } , 1000);
    }
});
