const { GuildMember } = require("discord.js");
const { GuildXp, UserConfig } = require("../../Mongoose/Models");

module.exports = {
    /**
     * Deletes all Database Entries relating to the Member which left/removed from the Guild this Bot is in.
     * @param {GuildMember} member 
     */
    async main(member)
    {
        // Make sure stuff actually exists first
        let checkXp = await GuildXp.exists({ userId: member.id });
        let checkConfig = await UserConfig.exists({ userId: member.id });

        // Delete Entries 
        if ( checkXp != null ) { await GuildXp.deleteMany({ userId: member.id }); }
        if ( checkConfig != null ) { await UserConfig.deleteMany({ userId: member.id }); }

        return;
    }
}
