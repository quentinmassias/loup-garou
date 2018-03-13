module.exports = function ()
{
    const i18n = require("i18n");

    i18n.configure({
        locales: ['fr'],
        directory: './locales',
        objectNotation: true,
        register: global
    });

    i18n.setLocale('fr');
};