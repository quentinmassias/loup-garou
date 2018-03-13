const Role = require('./Role');

module.exports = class Werewolf extends Role
{
    constructor()
    {
        super();
        this.tag = 'werewolf';
        this.imagePath = 'werewolf.jpg';
        this.name = 'Loup-Garou';
        this.description = 'Vous êtes un Loup-Garou, vous devez manger les villageois pendant la nuit, ahouuuu.'
    }
};