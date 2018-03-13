const config = require('../config/config');

module.exports = class Command
{
    static match (message)
    {
        return false;
    }

    static flagExists(elem, flag)
    {
        return elem.startsWith(config.app.flag.start_character + flag + config.app.flag.define_value_character);
    }

    static getFlagValue(elem, flag)
    {
        return elem.replace(config.app.flag.start_character + flag + config.app.flag.define_value_character, '');
    }
};