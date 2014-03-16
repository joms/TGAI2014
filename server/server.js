var net = require('net');
require('./astar.js');

var HOST = '127.0.0.1';
var PORT = 54321;

var client = new net.Socket();
client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    client.write('martinerkul');
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
    client.destroy();
});

var dummymap = [
    [0,0,0,0,0,0,0,0],
    [0,2,2,1,1,1,1,0],
    [0,2,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,2,0],
    [0,1,1,1,1,2,2,0],
    [0,0,0,0,0,0,0,0]
];

var graph = new Graph(dummymap);
var start = graph.nodes[1][1];
var end  = graph.nodes[1][2];
var result = astar.search(graph.nodes, start, end);

console.log(result);