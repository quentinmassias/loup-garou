require('./Module/i18n/init')();

const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config/config');
const hiddenConfig = require('./config/hidden-config');
const PartyCommand = require('./Command/Werewolf/PartyCommand');

bot.on('message', function (message) {
    if(message.content.startsWith(config.app.command_character))
    {
        message.content = message.content.replace(config.app.command_character, '');
        PartyCommand.match(message);
    }
});

createdParties = [];

bot.login(hiddenConfig.token);