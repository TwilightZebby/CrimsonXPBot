const { Guild } = require("discord.js");
const { GuildConfig, GuildBlocklist, GuildXp, GuildTextRole, GuildVoiceRole } = require("../../Mongoose/Models");

module.exports = {
    /**
     * Deletes all Database Entries relating to the Guild which the Bot has left or been removed from.
     * @param {Guild} guild 
     */
    async main(guild)
    {
        // Make sure stuff actually exists first
        let checkConfig = await GuildConfig.exists({ guildId: guild.id });
        let checkBlocklist = await GuildBlocklist.exists({ guildId: guild.id });
        let checkGuildXp = await GuildXp.exists({ guildId: guild.id });
        let checkTextRoles = await GuildTextRole.exists({ guildId: guild.id });
        let checkVoiceRoles = await GuildVoiceRole.exists({ guildId: guild.id });

        // Delete Entries 
        if ( checkConfig != null ) { await GuildConfig.deleteOne({ guildId: guild.id }); }
        if ( checkBlocklist != null ) { await GuildBlocklist.deleteMany({ guildId: guild.id }); }
        if ( checkGuildXp != null ) { await GuildXp.deleteMany({ guildId: guild.id }); }
        if ( checkTextRoles != null ) { await GuildTextRole.deleteMany({ guildId: guild.id }); }
        if ( checkVoiceRoles != null ) { await GuildVoiceRole.deleteMany({ guildId: guild.id }); }

        return;
    }
}
