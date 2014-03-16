var net = require('net');

var HOST = '127.0.0.1';
var PORT = 54321;

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    client.write('I am Chuck Norris!');

});

client.on('error', function(data) {
    console.log('ERROR: ' + data);
    client.destroy();
});

client.on('data', function(data) {
    console.log('DATA: ' + data);

});

client.on('close', function() {
    console.log('Connection closed');
});