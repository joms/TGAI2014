var net = require('net');
require('./astar.js');
var p = require('./parser.js');
var Navigator = require('./navigation.js');
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
	var created = true 
	var mapblob = p.parser(data, created)
	randommove()
});

client.on('close', function() {
    console.log('Connection closed');
    client.destroy();
});

function randommove() {
	var ran = Math.floor((Math.random()*5));
	var move = ["UP","DOWN","LEFT","RIGHT","BOMB"]
	client.write(move[ran])
}

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
var end  = graph.nodes[6][6];
var result = astar.search(graph.nodes, start, end);

var n = new Navigator(result, dummymap);
n.update(start.x, start.y, "X");

for (var i = 0; i < result.length; i++)
{
    console.log(n.move(i));
}

console.log(n.map);