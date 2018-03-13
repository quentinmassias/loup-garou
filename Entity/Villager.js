const Role = require('./Role');

module.exports = class Villager extends Role
{
    constructor()
    {
        super();
        this.tag = 'villager';
        this.imagePath = 'villager.jpg';
        this.name = 'Villageois';
        this.description = "Vous êtes un Villageois, vous n'avez pas de pouvoir autre que celui de voter pendant la journée."
    }
};