var net = require('net');
var GameStateHandler = require('./gamestate.js');
var iter = 0 
var HOST = 'localhost';
var PORT = 54321;
var client = new net.Socket();

var GameState = new GameStateHandler(client);

/**
 * Connects to the server on given port and host
 */
function Connect()
{
    client.connect(PORT, HOST);
}
// Call connect when server.js starts
Connect();

client.on('connect', function()
{
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    client.write('JSON\n');
    client.write('NAME GIR\n');
})

client.on('error', function(data) {
    console.log('ERROR: ' + data);
    client.destroy();
});

client.on('data', function(data) {
    var hrstart = process.hrtime();
    iter++;
    console.log("--------Iteration : " + iter + "------");
    //console.log(data.toString("utf-8"));

    // Splits data on \n
    var d = data.toString("utf-8").split("\n");

    // Removes last object in array, as it's an \n
    d.pop();

    // Send all data-string to Update()
    for (var i = 0; i < d.length; i++)
    {
        GameState.Update(JSON.parse(d[i]));
    }

    var hrend = process.hrtime(hrstart);
    console.info("Execution time: %ds %dms", hrend[0], hrend[1]/1000000);
    console.log("--------------------------------------\n");
});

client.on('close', function(error) {
    if (error == true)
    {
        console.log("Unexpected disconnect");
    } else {
        console.log("Disconnected. Trying reconnect in 1 second");

        // Try to reconnect once in 1 second
        setTimeout(function()
        {
            Connect();
        } , 1000);
        client.destroy();
    }
});


