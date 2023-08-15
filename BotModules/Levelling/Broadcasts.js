const { Message } = require("discord.js");
const { GuildConfig, UserConfig } = require("../../Mongoose/Models");



module.exports = {

    /**
     * Broadcasts the Level UP Message, if enabled in Guild
     * @param {Message} message
     * @param {Number} level
     */
    async levelUp(message, level)
    {
        // Check Guild has enabled Broadcast Messages
        if ( await GuildConfig.exists({ guildId: message.guildId }) == null ) { return; }

        let fetchedConfig = await GuildConfig.findOne({ guildId: message.guildId });

        if ( fetchedConfig.broadcastChannel === "DISABLE" ) { return; }
        
        
        // Contruct string
        let levelUpMessage = fetchedConfig.rankupMessage.replace("{user}", `<@${message.author.id}>`).replace("{level}", `${level}`);
        
        // Set mention state
        let enableMentions = false;
        let fetchedUserConfig = null;

        if ( await UserConfig.exists({ userId: message.author.id }) == null ) { /* Do nothing */ }
        fetchedUserConfig = await UserConfig.findOne({ userId: message.author.id });
        enableMentions = fetchedUserConfig.broadcastMentions;

        
        if ( fetchedConfig.broadcastChannel === "CURRENT" )
        {
            // Broadcast in current Channel
            if ( enableMentions ) { await message.channel.send({ allowedMentions: { parse: ['users'] }, content: levelUpMessage }); }
            else { await message.channel.send({ allowedMentions: { parse: [] }, content: levelUpMessage }); }
        }
        else
        {
            // Broadcast in specified Channel
            let guildChannel = await message.guild.channels.fetch(fetchedConfig.broadcastChannel);
            
            if ( enableMentions ) { await guildChannel.send({ allowedMentions: { parse: ['users'] }, content: levelUpMessage }); }
            else { await guildChannel.send({ allowedMentions: { parse: [] }, content: levelUpMessage }); }
        }

        return;
    },





    /**
     * Broadcasts the Level DOWN Message, if enabled in Guild
     * @param {Message} message
     * @param {Number} level
     */
    async levelDown(message, level)
    {
        // Check Guild has enabled Broadcast Messages
        if ( await GuildConfig.exists({ guildId: message.guildId }) == null ) { return; }

        let fetchedConfig = await GuildConfig.findOne({ guildId: message.guildId });

        if ( fetchedConfig.broadcastChannel === "DISABLE" ) { return; }
        
        
        // Contruct string
        let levelDownMessage = fetchedConfig.rankdownMessage.replace("{user}", `<@${message.author.id}>`).replace("{level}", `${level}`);
        
        // Set mention state
        let enableMentions = false;
        let fetchedUserConfig = null;

        if ( await UserConfig.exists({ userId: message.author.id }) == null ) { /* Do nothing */ }
        fetchedUserConfig = await UserConfig.findOne({ userId: message.author.id });
        enableMentions = fetchedUserConfig.broadcastMentions;

        
        if ( fetchedConfig.broadcastChannel === "CURRENT" )
        {
            // Broadcast in current Channel
            if ( enableMentions ) { await message.channel.send({ allowedMentions: { parse: ['users'] }, content: levelDownMessage }); }
            else { await message.channel.send({ allowedMentions: { parse: [] }, content: levelDownMessage }); }
        }
        else
        {
            // Broadcast in specified Channel
            let guildChannel = await message.guild.channels.fetch(fetchedConfig.broadcastChannel);
            
            if ( enableMentions ) { await guildChannel.send({ allowedMentions: { parse: ['users'] }, content: levelDownMessage }); }
            else { await guildChannel.send({ allowedMentions: { parse: [] }, content: levelDownMessage }); }
        }

        return;
    }

};
