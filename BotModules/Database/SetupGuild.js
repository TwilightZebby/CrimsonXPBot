const { Guild } = require("discord.js");
const { GuildConfig } = require("../../Mongoose/Models");

module.exports = {
    /**
     * Sets-up new Database Entries when the Bot joins a new Guild.
     * @param {Guild} guild 
     */
    async main(guild)
    {
        // Edge-case check
        let checkConfig = await GuildConfig.exists({ guildId: guild.id });
        if ( checkConfig != null ) { return; }

        // Setup Tables
        await GuildConfig.create({ guildId: guild.id });

        return;
    }
}
