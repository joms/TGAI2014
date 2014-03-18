var parser = require('./parser.js');

function gamestate(socket)
{
    this.socket = socket;

    this.alive = true;
    this.powerups = [];
    this.state = "ready";
    this.target = [];
    this.me = {};

    this.commands = [];

    this.map = [];
    this.bombs = [];
    this.players = [];
}

gamestate.prototype.Update = function(data)
{
    if (data.type == "status update") {
        this.map = parser.parse(data.map);
        this.bombs = data.bombs;
        this.players = data.players;
        this.me.x = data.x;
        this.me.y = data.y;

/*        if (this.commands.length > 0)
        {
            this.socket.write(this.commands[0]);
            this.commands.shift();
        }*/

        //this.state = "waiting";
    } else if (data.type == "end round") {

    } else if (data.type == "dead") {
        this.alive = false;
    }
}

module.exports = gamestate;