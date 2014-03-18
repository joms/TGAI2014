var parser = require('./parser.js');

function gamestate(socket)
{
    this.socket = socket;

    this.alive = true;
    this.powerups = [];
    this.state = "ready";
    this.target = [];

    this.commands = [];

    this.map = [];
    this.bombs = [];
    this.players = [];
}

gamestate.prototype.Update = function(data)
{
    console.log(data.type);
    if (data.type == "ok")
    {
        this.state == "ready";

        if (this.commands.length > 0)
        {
            this.socket.write(this.commands[0]);
            this.commands.shift();
        }
    } else if (data.type == "status update") {
        var p = parser.parse(data);
        this.map = p.map;
        this.bombs = data.bombs;
        this.players = data.players;

        this.state = "waiting";
    } else if (data.type == "end round") {

    } else if (data.type == "dead") {
        this.alive = false;
    }
}

module.exports = gamestate;