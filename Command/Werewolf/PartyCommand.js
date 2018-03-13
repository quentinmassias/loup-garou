const Command = require('../Command');
const Player = require('../../Entity/Player');
const Party = require('../../Entity/Party');
const Villager = require('../../Entity/Villager');
const Werewolf = require('../../Entity/Werewolf');

const _ = require('lodash');

let commandMessage = null;
let args = null;

module.exports = class PartyCommand extends Command
{
    static get COMMAND_PREFIX()
    {
        return 'party';
    }

    static getTitleFormat(text)
    {
        let formattedText = "\n------------------------------------\n";
        formattedText += '**' + text + '**';
        formattedText += "\n------------------------------------\n";

        return formattedText
    }

    static get AVAILABLE_ROLES()
    {
        return [
            new Villager(),
            new Werewolf()
        ];
    }

    static match(message)
    {
        if(message.content.startsWith(this.COMMAND_PREFIX))
        {
            commandMessage = message;
            args = message.content.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
            args.shift();

            switch (args[0])
            {
                case 'create':
                    this.create();
                    break;

                case 'delete':
                    this.delete();
                    break;

                case 'join':
                    this.join();
                    break;

                case 'list':
                    this.list();
                    break;

                case 'list-players':
                    this.listPlayers();
                    break;

                case 'start':
                    this.start();
                    break;

                case 'help':
                    this.help();
                    break;

                default:
                    commandMessage.reply("cette commande n'existe pas, tu trouveras la liste des commandes disponibles en tapant '!party help'.");
            }
        }
    }

    static create()
    {
        args.shift();

        let maxPlayerNumber = null;

        args.forEach((elem) => {
           if (this.flagExists(elem, 'player-number')) {
               maxPlayerNumber = this.getFlagValue(elem, 'player-number');
           }
        });

        if (this.findPartyByID(args[0])) {
            commandMessage.reply("une partie avec l'identifiant " + args[0] + ' existe déjà.');
        } else
        {
            let party = new Party(args[0], commandMessage.author, maxPlayerNumber);
            createdParties.push(party);
            commandMessage.reply('la partie ' + party.id + ' a été créée !' + (party.maxPlayerNumber ? ' Elle peut contenir ' + party.maxPlayerNumber + ' joueurs.' : ''));
        }
    }

    static delete()
    {
        let party = this.findPartyByCreator(commandMessage.author);

        if (party)
        {
            const partyIndex = createdParties.indexOf(party);
            createdParties.splice(partyIndex, 1);
            commandMessage.reply('vous avez supprimé la partie ' + party.id + '.');
        } else {
            commandMessage.reply("vous n'êtes le créateur d'aucune partie.");
        }
    }

    static join()
    {
        args.shift();

        let player = new Player(commandMessage.author);
        let party = this.findPartyByID(args[0]);

        if (party)
        {
            if (party.started) {
                commandMessage.reply('cette partie a déjà commencée.');
            } else if (this.isPlayerAlreadyInParty(player)) {
                commandMessage.reply('vous êtes déjà dans une partie.');
            } else if (party.maxPlayerNumber && party.maxPlayerNumber - party.players.length === 0) {
                commandMessage.reply('la partie est complète.');
            }
            else
            {
                party.addPlayer(player);
                commandMessage.reply('vous avez rejoint la partie ' + party.id + '.' + (party.maxPlayerNumber ? ' Il reste ' + (party.maxPlayerNumber - party.players.length) + ' places.' : ''));
            }
        } else {
            commandMessage.reply("la partie que vous essayez de rejoindre n'existe pas.");
        }
    }

    static list()
    {
        let partyList = "\n\n";

        createdParties.forEach((party) => {
            partyList += '- ' + party.id + ' => Créateur : ' + party.creator.username + " ; Statut : " + (party.started ? "En cours" : "En préparation") +  "\n";
        });

        commandMessage.reply("voici la liste des parties existantes :" + partyList);
    }

    static listPlayers()
    {
        args.shift();

        let party = this.findPartyByID(args[0]);
        let playerList = "\n\n";

        if (party)
        {
            party.players.forEach((player) => {
                playerList += '- ' + player.user.username + "\n"
            });

            commandMessage.reply("voici la liste des joueurs pour la partie " + party.id + " :" + playerList);
        } else
        {
            commandMessage.reply("la partie demandée n'existe pas.");
        }
    }

    static start()
    {
        let party = this.findPartyByCreator(commandMessage.author);

        if (party)
        {
            if (party.started) {
                commandMessage.reply('votre partie a déjà commencée !');
            } else
            {
                party.started = true;

                commandMessage.guild.createChannel('werewolf-' + party.id, 'text')
                    .then(channel =>
                    {
                        channel.overwritePermissions(commandMessage.guild.id, {
                            VIEW_CHANNEL: false,
                            READ_MESSAGES: false,
                            SEND_MESSAGES: false
                        }).catch(console.error);

                        party.players.forEach(player => {
                            channel.overwritePermissions(player.user, {
                                VIEW_CHANNEL: true,
                                READ_MESSAGES: true,
                                READ_MESSAGE_HISTORY: true,
                                USE_EXTERNAL_EMOJIS: true,
                                SEND_MESSAGES: true,
                                ADD_REACTIONS: true
                            })
                                .then(() => console.log(channel))
                                .catch(console.error);

                            this.sendPartyStartNotificationToPlayer(party, player);
                            this.giveRoleToPlayer(party, player);
                        });
                    })
                    .catch(console.error);
            }
        } else {
            commandMessage.reply("vous n'êtes le créateur d'aucune partie.");
        }
    }

    static help()
    {
        commandMessage.author.send(`
            **Préfixe de la commande :** __!party__
            
            - create {id} [maxPlayerNumber] : *Créer une nouvelle partie*\n
            - delete : *Supprime la partie dont vous êtes le créateur*\n
            - join {id} : *Rejoins la partie*\n
            - start : *Lance la partie dont vous êtes le créateur*\n
            - list : *Donne la liste des parties créées*\n
            - list-players {id} : *Donne la liste des joueurs de la partie*\n
        `);
    }

    static findPartyByID(id)
    {
        let partyIndex = _.findIndex(createdParties, (party) => party.id === id);

        return partyIndex !== -1 ? createdParties[partyIndex] : null;
    }

    static findPartyByCreator(creator)
    {
        let partyIndex = _.findIndex(createdParties, (party) => party.creator === creator);

        return partyIndex !== -1 ? createdParties[partyIndex] : null;
    }

    static isPlayerAlreadyInParty(player)
    {
        let isAlreadyInParty = false;

        createdParties.forEach(function (party)
        {
            if (_.findIndex(party.players, (p) => p.user.id === player.user.id) !== -1) {
                isAlreadyInParty = true;
            }
        });

        return isAlreadyInParty;
    }

    static sendPartyStartNotificationToPlayer(party, player)
    {
        const message = 'La partie ' + party.id + ' commence.';
        player.user.send(this.getTitleFormat(message));
    }

    static sendRoleNotificationToPlayer(player)
    {
        player.user.send(`
        **${player.role.name}**
        
        ${player.role.description}
        `, {
            files: ["./assets/img/Role/" + player.role.imagePath]
        });
    }

    static giveRoleToPlayer(party, player)
    {
        player.role = this.getRandomRole(party);
        party.addPresentRole(player.role);
        this.sendRoleNotificationToPlayer(player);
    }

    static getRandomRole(party)
    {
        const randomRole = this.AVAILABLE_ROLES[_.random(0, this.AVAILABLE_ROLES.length - 1)];

        if (party.presentRoles.length && (_.findIndex(party.presentRoles, (role) => role.tag === randomRole.tag) !== -1)) {
            return this.getRandomRole(party);
        } else {
            return randomRole;
        }
    }
};