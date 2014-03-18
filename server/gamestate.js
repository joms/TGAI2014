exports = gamestate;

require('./parser.js');

gamestate = function()
{
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
    if (data.type == "ok")
    {
        this.state == ready;
    } else if (data.type == "status update") {
        var p = parse(data);
        this.map = p.map;
        this.bombs = data.bombs;
        this.players = data.players;


        this.state = "waiting";
    } else if (data.type == "end round") {

    } else if (data.type == "dead") {
        this.alive = false;
    }

}