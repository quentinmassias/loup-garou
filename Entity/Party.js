module.exports = class Party
{
    constructor(id, creator, maxPlayerNumber = null)
    {
        this.id = id;
        this.creator = creator;
        this.maxPlayerNumber = maxPlayerNumber;
        this.started = false;
        this.players = [];
        this.presentRoles = [];
        this.deadRoles = [];
    }

    addPlayer(player)
    {
        this.players.push(player);
    }

    addPresentRole(role)
    {
        this.presentRoles.push(role);
    }
};